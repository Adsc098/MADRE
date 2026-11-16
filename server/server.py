"""
Servidor Backend SICEP en Python
Conexión REST API a Base de Datos MySQL (sicep_escolar)
"""

import os
import sys
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
import pymysql

try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

# Cargar variables de entorno o valores por defecto
PORT = int(os.environ.get('PORT', 3000))
DB_HOST = os.environ.get('DB_HOST', '127.0.0.1')
DB_USER = os.environ.get('DB_USER', 'root')
DB_PASSWORD = os.environ.get('DB_PASSWORD', 'adsc098')
DB_NAME = os.environ.get('DB_NAME', 'sicep_escolar')
DB_PORT = int(os.environ.get('DB_PORT', 3306))

# Si existe archivo .env en la misma carpeta, leerlo
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                k = k.strip()
                v = v.strip()
                if k == 'PORT': PORT = int(v)
                elif k == 'DB_HOST': DB_HOST = v
                elif k == 'DB_USER': DB_USER = v
                elif k == 'DB_PASSWORD': DB_PASSWORD = v
                elif k == 'DB_NAME': DB_NAME = v
                elif k == 'DB_PORT': DB_PORT = int(v)

def get_db_connection():
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        port=DB_PORT,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=False
    )

class SicepHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed_path = self.path.split('?')[0].rstrip('/')
        
        if parsed_path == '/api/health':
            try:
                conn = get_db_connection()
                with conn.cursor() as cur:
                    cur.execute("SELECT 1 AS ok")
                conn.close()
                self._send_json(200, {
                    "status": "ok",
                    "servidor": "Conectado a MySQL (Python)",
                    "baseDeDatos": DB_NAME
                })
            except Exception as e:
                self._send_json(500, {
                    "status": "error",
                    "mensaje": f"Sin conexión a MySQL: {e}"
                })
        elif parsed_path == '/api/estado':
            try:
                conn = get_db_connection()
                with conn.cursor() as cur:
                    # 1. Escuela y grupo
                    cur.execute("SELECT * FROM escuelas LIMIT 1")
                    esc = cur.fetchone() or {}

                    cur.execute("""
                        SELECT g.*, d.nombre_completo as docente_nombre, d.usuario 
                        FROM grupos g 
                        JOIN docentes d ON g.id_docente = d.id_docente 
                        LIMIT 1
                    """)
                    grp = cur.fetchone() or {}

                    school_config = {
                        "schoolType": esc.get('tipo_institucion', 'ESCUELA PRIMARIA FEDERAL'),
                        "schoolName": esc.get('nombre_oficial', 'SALVADOR ZUBIRAN ANCHONDO T. M.'),
                        "cct": esc.get('cct', '19DPR1719T'),
                        "zone": esc.get('zona_escolar', 'No. 114'),
                        "region": esc.get('region', 'No. 6'),
                        "phone": esc.get('telefono', '81 81 48 58 08'),
                        "address": esc.get('direccion_oficial', 'CIRCUITO DE LOS LLANOS S/N COL. EX HDA SANTA ROSA, APODACA N. L.'),
                        "teacher": grp.get('docente_nombre', 'CLAUDIA CHAVARRÍA RAMÍREZ'),
                        "cycle": grp.get('ciclo_escolar', '2026 - 2027'),
                        "group": f"{grp.get('grado', '6')}° {grp.get('seccion', 'A')}" if grp.get('grado') else '6° A'
                    }

                    # 2. Alumnos
                    cur.execute("SELECT * FROM alumnos WHERE id_grupo = %s ORDER BY numero_lista ASC", (grp.get('id_grupo', 1),))
                    alumnos = cur.fetchall()

                    # 3. Calificaciones y Ponderaciones
                    periods = ['DIAGNOSTICO', 'TRIMESTRE_1', 'TRIMESTRE_2', 'TRIMESTRE_3']
                    students = []

                    for a in alumnos:
                        aid = a['id_alumno']
                        cur.execute("SELECT * FROM calificaciones_periodo WHERE id_alumno = %s", (aid,))
                        califs = {c['periodo']: c for c in cur.fetchall()}

                        cur.execute("SELECT * FROM ponderaciones_periodo WHERE id_alumno = %s", (aid,))
                        ponds = {p['periodo']: p for p in cur.fetchall()}

                        grades_by_period = {}
                        weighted_by_period = {}

                        for p in periods:
                            c = califs.get(p)
                            grades_by_period[p] = {
                                "lenguajes": float(c['lenguajes']) if c and c['lenguajes'] is not None else None,
                                "saberes": float(c['saberes_pensamiento']) if c and c['saberes_pensamiento'] is not None else None,
                                "etica": float(c['etica_naturaleza']) if c and c['etica_naturaleza'] is not None else None,
                                "humano": float(c['de_lo_humano']) if c and c['de_lo_humano'] is not None else None
                            }

                            w = ponds.get(p)
                            weighted_by_period[p] = {
                                "examen": float(w['examen']) if w and w['examen'] is not None else None,
                                "tareas": float(w['tareas']) if w and w['tareas'] is not None else None,
                                "trabajos": float(w['trabajos']) if w and w['trabajos'] is not None else None,
                                "muestreos": float(w['muestreos']) if w and w['muestreos'] is not None else None,
                                "proyectos": float(w['proyectos']) if w and w['proyectos'] is not None else None,
                                "participacion": float(w['participacion']) if w and w['participacion'] is not None else None,
                                "disciplina": float(w['disciplina']) if w and w['disciplina'] is not None else None
                            }

                        students.append({
                            "id": f"stu_{a['numero_lista']}",
                            "id_bd": aid,
                            "no": a['numero_lista'],
                            "name": a['nombre_completo'],
                            "gender": a['genero'],
                            "group": school_config['group'],
                            "notes": a.get('notas_observaciones', '') or '',
                            "grades": grades_by_period,
                            "weighted": weighted_by_period
                        })

                conn.close()
                self._send_json(200, {
                    "currentView": "inicio",
                    "currentPeriod": "DIAGNOSTICO",
                    "searchQuery": "",
                    "schoolConfig": school_config,
                    "security": {
                        "username": grp.get('usuario', 'cchavarria'),
                        "password": "***"
                    },
                    "students": students
                })
            except Exception as e:
                self._send_json(500, {"error": str(e)})
        else:
            self._send_json(404, {"error": "Ruta no encontrada"})

    def do_POST(self):
        parsed_path = self.path.split('?')[0].rstrip('/')
        if parsed_path == '/api/guardar':
            try:
                content_len = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_len)
                data = json.loads(body.decode('utf-8'))

                conn = get_db_connection()
                try:
                    with conn.cursor() as cur:
                        school = data.get('schoolConfig')
                        if school:
                            cur.execute("""
                                UPDATE escuelas SET 
                                  nombre_oficial = %s, tipo_institucion = %s, cct = %s, 
                                  zona_escolar = %s, region = %s, telefono = %s, direccion_oficial = %s 
                                WHERE id_escuela = 1
                            """, (
                                school.get('schoolName'), school.get('schoolType'), school.get('cct'),
                                school.get('zone'), school.get('region'), school.get('phone'), school.get('address')
                            ))

                        students = data.get('students', [])
                        for s in students:
                            cur.execute("SELECT id_alumno FROM alumnos WHERE id_grupo = 1 AND numero_lista = %s", (s['no'],))
                            row = cur.fetchone()
                            if row:
                                aid = row['id_alumno']
                                cur.execute("UPDATE alumnos SET nombre_completo = %s, genero = %s, notas_observaciones = %s WHERE id_alumno = %s",
                                            (s['name'], s['gender'], s.get('notes', ''), aid))
                            else:
                                cur.execute("INSERT INTO alumnos (id_grupo, numero_lista, nombre_completo, genero, notas_observaciones) VALUES (1, %s, %s, %s, %s)",
                                            (s['no'], s['name'], s['gender'], s.get('notes', '')))
                                aid = cur.lastrowid

                            grades = s.get('grades', {})
                            for period, g in grades.items():
                                vals = [g.get('lenguajes'), g.get('saberes'), g.get('etica'), g.get('humano')]
                                num_vals = [v for v in vals if v is not None]
                                prom = round(sum(num_vals) / len(num_vals), 1) if num_vals else None

                                cur.execute("""
                                    INSERT INTO calificaciones_periodo 
                                      (id_alumno, periodo, lenguajes, saberes_pensamiento, etica_naturaleza, de_lo_humano, promedio_periodo)
                                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                                    ON DUPLICATE KEY UPDATE 
                                      lenguajes = VALUES(lenguajes),
                                      saberes_pensamiento = VALUES(saberes_pensamiento),
                                      etica_naturaleza = VALUES(etica_naturaleza),
                                      de_lo_humano = VALUES(de_lo_humano),
                                      promedio_periodo = VALUES(promedio_periodo)
                                """, (aid, period, g.get('lenguajes'), g.get('saberes'), g.get('etica'), g.get('humano'), prom))

                            weighted = s.get('weighted', {})
                            for period, w in weighted.items():
                                cur.execute("""
                                    INSERT INTO ponderaciones_periodo 
                                      (id_alumno, periodo, examen, tareas, trabajos, muestreos, proyectos, participacion, disciplina)
                                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                                    ON DUPLICATE KEY UPDATE 
                                      examen = VALUES(examen),
                                      tareas = VALUES(tareas),
                                      trabajos = VALUES(trabajos),
                                      muestreos = VALUES(muestreos),
                                      proyectos = VALUES(proyectos),
                                      participacion = VALUES(participacion),
                                      disciplina = VALUES(disciplina)
                                """, (aid, period, w.get('examen'), w.get('tareas'), w.get('trabajos'), w.get('muestreos'),
                                      w.get('proyectos'), w.get('participacion'), w.get('disciplina')))

                    conn.commit()
                    self._send_json(200, {"success": True, "mensaje": "Guardado correctamente en MySQL"})
                except Exception as e:
                    conn.rollback()
                    self._send_json(500, {"error": str(e)})
                finally:
                    conn.close()
            except Exception as e:
                self._send_json(500, {"error": str(e)})
        else:
            self._send_json(404, {"error": "Ruta no encontrada"})

    def _send_json(self, code, data):
        self.send_response(code)
        self._send_cors_headers()
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

    def log_message(self, format, *args):
        # Silenciar logs para que no saturen la consola
        pass

def run():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, SicepHandler)
    print(f">> Servidor Python SICEP activo en http://localhost:{PORT}")
    print(f">> Conectado a MySQL ({DB_HOST}:{DB_PORT}) - Base de datos: {DB_NAME}")
    httpd.serve_forever()

if __name__ == '__main__':
    run()
