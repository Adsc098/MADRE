/**
 * Servidor Backend SICEP - Conexión API REST a MySQL
 * ===================================================
 */

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Pool de conexiones a MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sicep_escolar',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Ruta de Salud / Estado del Servidor
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS resultado');
    res.json({
      status: 'ok',
      servidor: 'Conectado a MySQL',
      baseDeDatos: process.env.DB_NAME || 'sicep_escolar'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      mensaje: 'Servidor activo pero sin conexión a MySQL: ' + err.message
    });
  }
});

// Obtener Estado Completo (Escuela, Grupo, Alumnos, Calificaciones)
app.get('/api/estado', async (req, res) => {
  try {
    // 1. Obtener datos de la Escuela y Grupo
    const [escuelas] = await pool.query('SELECT * FROM escuelas LIMIT 1');
    const [grupos] = await pool.query('SELECT g.*, d.nombre_completo as docente_nombre, d.usuario FROM grupos g JOIN docentes d ON g.id_docente = d.id_docente LIMIT 1');
    
    const esc = escuelas[0] || {};
    const grp = grupos[0] || {};

    const schoolConfig = {
      schoolType: esc.tipo_institucion || 'ESCUELA PRIMARIA FEDERAL',
      schoolName: esc.nombre_oficial || 'SALVADOR ZUBIRAN ANCHONDO T. M.',
      cct: esc.cct || '19DPR1719T',
      zone: esc.zona_escolar || 'No. 114',
      region: esc.region || 'No. 6',
      phone: esc.telefono || '81 81 48 58 08',
      address: esc.direccion_oficial || 'CIRCUITO DE LOS LLANOS S/N COL. EX HDA SANTA ROSA, APODACA N. L.',
      teacher: grp.docente_nombre || 'CLAUDIA CHAVARRÍA RAMÍREZ',
      cycle: grp.ciclo_escolar || '2026 - 2027',
      group: grp.grado ? `${grp.grado}° ${grp.seccion}` : '6° A'
    };

    // 2. Obtener Alumnos
    const [alumnosRows] = await pool.query(
      'SELECT * FROM alumnos WHERE id_grupo = ? ORDER BY numero_lista ASC',
      [grp.id_grupo || 1]
    );

    // 3. Obtener Calificaciones y Ponderaciones
    const periods = ['DIAGNOSTICO', 'TRIMESTRE_1', 'TRIMESTRE_2', 'TRIMESTRE_3'];
    
    const students = await Promise.all(
      alumnosRows.map(async (a) => {
        const id = 'stu_' + a.numero_lista;
        const gradesByPeriod = {};
        const weightedByPeriod = {};

        const [califs] = await pool.query(
          'SELECT * FROM calificaciones_periodo WHERE id_alumno = ?',
          [a.id_alumno]
        );
        const [ponds] = await pool.query(
          'SELECT * FROM ponderaciones_periodo WHERE id_alumno = ?',
          [a.id_alumno]
        );

        periods.forEach((p) => {
          const c = califs.find(x => x.periodo === p);
          gradesByPeriod[p] = {
            lenguajes: c && c.lenguajes !== null ? Number(c.lenguajes) : null,
            saberes: c && c.saberes_pensamiento !== null ? Number(c.saberes_pensamiento) : null,
            etica: c && c.etica_naturaleza !== null ? Number(c.etica_naturaleza) : null,
            humano: c && c.de_lo_humano !== null ? Number(c.de_lo_humano) : null
          };

          const w = ponds.find(x => x.periodo === p);
          weightedByPeriod[p] = {
            examen: w && w.examen !== null ? Number(w.examen) : null,
            tareas: w && w.tareas !== null ? Number(w.tareas) : null,
            trabajos: w && w.trabajos !== null ? Number(w.trabajos) : null,
            muestreos: w && w.muestreos !== null ? Number(w.muestreos) : null,
            proyectos: w && w.proyectos !== null ? Number(w.proyectos) : null,
            participacion: w && w.participacion !== null ? Number(w.participacion) : null,
            disciplina: w && w.disciplina !== null ? Number(w.disciplina) : null
          };
        });

        return {
          id,
          id_bd: a.id_alumno,
          no: a.numero_lista,
          name: a.nombre_completo,
          gender: a.genero,
          group: schoolConfig.group,
          notes: a.notas_observaciones || '',
          grades: gradesByPeriod,
          weighted: weightedByPeriod
        };
      })
    );

    res.json({
      schoolConfig,
      security: {
        username: grp.usuario || 'cchavarria',
        password: '***'
      },
      students
    });
  } catch (err) {
    console.error('Error al obtener estado de MySQL:', err);
    res.status(500).json({ error: err.message });
  }
});

// Guardar / Actualizar Estado en MySQL
app.post('/api/guardar', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { schoolConfig, students } = req.body;

    // Actualizar configuración institucional si existe
    if (schoolConfig) {
      await conn.query(
        'UPDATE escuelas SET nombre_oficial = ?, tipo_institucion = ?, cct = ?, zona_escolar = ?, region = ?, telefono = ?, direccion_oficial = ? WHERE id_escuela = 1',
        [schoolConfig.schoolName, schoolConfig.schoolType, schoolConfig.cct, schoolConfig.zone, schoolConfig.region, schoolConfig.phone, schoolConfig.address]
      );
    }

    // Actualizar Alumnos y Calificaciones
    if (Array.isArray(students)) {
      for (const s of students) {
        // Buscar o insertar alumno
        const [existing] = await conn.query(
          'SELECT id_alumno FROM alumnos WHERE id_grupo = 1 AND numero_lista = ?',
          [s.no]
        );

        let alumnoId;
        if (existing.length > 0) {
          alumnoId = existing[0].id_alumno;
          await conn.query(
            'UPDATE alumnos SET nombre_completo = ?, genero = ?, notas_observaciones = ? WHERE id_alumno = ?',
            [s.name, s.gender, s.notes || '', alumnoId]
          );
        } else {
          const [ins] = await conn.query(
            'INSERT INTO alumnos (id_grupo, numero_lista, nombre_completo, genero, notas_observaciones) VALUES (1, ?, ?, ?, ?)',
            [s.no, s.name, s.gender, s.notes || '']
          );
          alumnoId = ins.insertId;
        }

        // Guardar calificaciones por periodo
        if (s.grades) {
          for (const [period, g] of Object.entries(s.grades)) {
            const vals = [g.lenguajes, g.saberes, g.etica, g.humano].filter(v => v !== null && !isNaN(v));
            const prom = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null;

            await conn.query(
              `INSERT INTO calificaciones_periodo (id_alumno, periodo, lenguajes, saberes_pensamiento, etica_naturaleza, de_lo_humano, promedio_periodo)
               VALUES (?, ?, ?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE 
                 lenguajes = VALUES(lenguajes),
                 saberes_pensamiento = VALUES(saberes_pensamiento),
                 etica_naturaleza = VALUES(etica_naturaleza),
                 de_lo_humano = VALUES(de_lo_humano),
                 promedio_periodo = VALUES(promedio_periodo)`,
              [alumnoId, period, g.lenguajes, g.saberes, g.etica, g.humano, prom]
            );
          }
        }

        // Guardar ponderaciones por periodo
        if (s.weighted) {
          for (const [period, w] of Object.entries(s.weighted)) {
            await conn.query(
              `INSERT INTO ponderaciones_periodo (id_alumno, periodo, examen, tareas, trabajos, muestreos, proyectos, participacion, disciplina)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE 
                 examen = VALUES(examen),
                 tareas = VALUES(tareas),
                 trabajos = VALUES(trabajos),
                 muestreos = VALUES(muestreos),
                 proyectos = VALUES(proyectos),
                 participacion = VALUES(participacion),
                 disciplina = VALUES(disciplina)`,
              [alumnoId, period, w.examen, w.tareas, w.trabajos, w.muestreos, w.proyectos, w.participacion, w.disciplina]
            );
          }
        }
      }
    }

    await conn.commit();
    res.json({ success: true, mensaje: 'Guardado correctamente en MySQL' });
  } catch (err) {
    await conn.rollback();
    console.error('Error guardando en MySQL:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor SICEP escuchando en http://localhost:${PORT}`);
  console.log(`🐬 Conexión configurada hacia MySQL: ${process.env.DB_NAME || 'sicep_escolar'}`);
});
