-- =============================================================================
-- SISTEMA DE CONTROL ESCOLAR Y CALIFICACIONES (SICEP)
-- SCRIPT DE BASE DE DATOS RELACIONAL PARA MYSQL WORKBENCH
-- Base de Datos: sicep_escolar
-- Diseñado con Arquitectura Multi-Usuario (Docentes, Escuelas, Grupos y Alumnos)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS sicep_escolar 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE sicep_escolar;

-- Desactivar temporalmente revisión de llaves foráneas para re-creación limpia
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS ponderaciones_periodo;
DROP TABLE IF EXISTS calificaciones_periodo;
DROP TABLE IF EXISTS campos_formativos;
DROP TABLE IF EXISTS alumnos;
DROP TABLE IF EXISTS grupos;
DROP TABLE IF EXISTS docentes;
DROP TABLE IF EXISTS escuelas;
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- 1. TABLA: escuelas
-- Información institucional que encabeza reportes oficiales
-- -----------------------------------------------------------------------------
CREATE TABLE escuelas (
  id_escuela INT AUTO_INCREMENT PRIMARY KEY,
  cct VARCHAR(20) NOT NULL UNIQUE,
  nombre_oficial VARCHAR(200) NOT NULL,
  tipo_institucion VARCHAR(100) DEFAULT 'ESCUELA PRIMARIA FEDERAL',
  zona_escolar VARCHAR(50) DEFAULT 'No. 114',
  region VARCHAR(50) DEFAULT 'No. 6',
  telefono VARCHAR(50) DEFAULT '81 81 48 58 08',
  direccion_oficial TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 2. TABLA: docentes (Usuarios del Sistema)
-- Permite el acceso multi-usuario (varios maestros en la misma escuela)
-- -----------------------------------------------------------------------------
CREATE TABLE docentes (
  id_docente INT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo VARCHAR(150) NOT NULL,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  password_pin VARCHAR(255) NOT NULL DEFAULT '2026',
  email VARCHAR(100) NULL,
  rol ENUM('docente', 'director', 'admin') DEFAULT 'docente',
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 3. TABLA: grupos
-- Vincula la escuela, el docente asignado, el grado, grupo y ciclo escolar
-- -----------------------------------------------------------------------------
CREATE TABLE grupos (
  id_grupo INT AUTO_INCREMENT PRIMARY KEY,
  id_escuela INT NOT NULL,
  id_docente INT NOT NULL,
  grado VARCHAR(10) NOT NULL,
  seccion VARCHAR(10) NOT NULL,
  ciclo_escolar VARCHAR(20) NOT NULL DEFAULT '2026 - 2027',
  nombre_identificador VARCHAR(50) GENERATED ALWAYS AS (CONCAT(grado, '° ', seccion, ' (', ciclo_escolar, ')')) VIRTUAL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_escuela) REFERENCES escuelas(id_escuela) ON DELETE CASCADE,
  FOREIGN KEY (id_docente) REFERENCES docentes(id_docente) ON DELETE CASCADE,
  UNIQUE KEY uk_grupo_ciclo (id_escuela, grado, seccion, ciclo_escolar)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 4. TABLA: alumnos
-- Estudiantes inscritos en cada grupo escolar
-- -----------------------------------------------------------------------------
CREATE TABLE alumnos (
  id_alumno INT AUTO_INCREMENT PRIMARY KEY,
  id_grupo INT NOT NULL,
  numero_lista INT NOT NULL,
  nombre_completo VARCHAR(200) NOT NULL,
  genero ENUM('H', 'M') NOT NULL,
  curp VARCHAR(18) NULL,
  notas_observaciones TEXT NULL,
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_grupo) REFERENCES grupos(id_grupo) ON DELETE CASCADE,
  UNIQUE KEY uk_alumno_lista (id_grupo, numero_lista)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 5. TABLA: campos_formativos
-- Los 4 campos formativos del plan de estudios oficial
-- -----------------------------------------------------------------------------
CREATE TABLE campos_formativos (
  id_campo VARCHAR(30) PRIMARY KEY,
  nombre_oficial VARCHAR(150) NOT NULL,
  descripcion TEXT NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 6. TABLA: calificaciones_periodo
-- Registro de calificaciones por alumno, periodo y campo formativo
-- -----------------------------------------------------------------------------
CREATE TABLE calificaciones_periodo (
  id_calificacion INT AUTO_INCREMENT PRIMARY KEY,
  id_alumno INT NOT NULL,
  periodo ENUM('DIAGNOSTICO', 'TRIMESTRE_1', 'TRIMESTRE_2', 'TRIMESTRE_3') NOT NULL,
  lenguajes DECIMAL(4, 1) NULL,
  saberes_pensamiento DECIMAL(4, 1) NULL,
  etica_naturaleza DECIMAL(4, 1) NULL,
  de_lo_humano DECIMAL(4, 1) NULL,
  promedio_periodo DECIMAL(4, 1) NULL,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_alumno) REFERENCES alumnos(id_alumno) ON DELETE CASCADE,
  UNIQUE KEY uk_alumno_periodo (id_alumno, periodo)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 7. TABLA: ponderaciones_periodo (Criterios de Evaluación 100%)
-- Desglose de actividades: examen, tareas, trabajos, proyectos, etc.
-- -----------------------------------------------------------------------------
CREATE TABLE ponderaciones_periodo (
  id_ponderacion INT AUTO_INCREMENT PRIMARY KEY,
  id_alumno INT NOT NULL,
  periodo ENUM('DIAGNOSTICO', 'TRIMESTRE_1', 'TRIMESTRE_2', 'TRIMESTRE_3') NOT NULL,
  examen DECIMAL(4, 1) NULL,
  tareas DECIMAL(4, 1) NULL,
  trabajos DECIMAL(4, 1) NULL,
  muestreos DECIMAL(4, 1) NULL,
  proyectos DECIMAL(4, 1) NULL,
  participacion DECIMAL(4, 1) NULL,
  disciplina DECIMAL(4, 1) NULL,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_alumno) REFERENCES alumnos(id_alumno) ON DELETE CASCADE,
  UNIQUE KEY uk_ponderacion_alumno_periodo (id_alumno, periodo)
) ENGINE=InnoDB;

-- =============================================================================
-- INSERCIÓN DE DATOS INICIALES (SEED DATA DEL ARCHIVO OFICIAL)
-- =============================================================================

-- 1. Insertar Escuela
INSERT INTO escuelas (id_escuela, cct, nombre_oficial, tipo_institucion, zona_escolar, region, telefono, direccion_oficial)
VALUES (1, '19DPR1719T', 'SALVADOR ZUBIRAN ANCHONDO T. M.', 'ESCUELA PRIMARIA FEDERAL', 'No. 114', 'No. 6', '81 81 48 58 08', 'CIRCUITO DE LOS LLANOS S/N COL. EX HDA SANTA ROSA, APODACA N. L.');

-- 2. Insertar Docente Principal (Profra. Claudia)
INSERT INTO docentes (id_docente, nombre_completo, usuario, password_pin, email, rol)
VALUES (1, 'CLAUDIA CHAVARRÍA RAMÍREZ', 'cchavarria', '2026', 'cchavarria@escuela.edu.mx', 'docente');

-- 3. Insertar Grupo 6° A
INSERT INTO grupos (id_grupo, id_escuela, id_docente, grado, seccion, ciclo_escolar)
VALUES (1, 1, 1, '6', 'A', '2026 - 2027');

-- 4. Insertar Catálogo de Campos Formativos
INSERT INTO campos_formativos (id_campo, nombre_oficial, descripcion) VALUES
('lenguajes', 'Lenguajes', 'Español, artes y lenguas originarias/extranjeras'),
('saberes', 'Saberes y Pensamiento Científico', 'Matemáticas y Ciencias Naturales'),
('etica', 'Ética, Naturaleza y Sociedades', 'Historia, Geografía y Formación Cívica'),
('humano', 'De lo Humano y lo Comunitario', 'Educación Física, Socioemocional y Vida Saludable');

-- 5. Insertar los 35 Estudiantes Oficiales de 6° A
INSERT INTO alumnos (id_grupo, numero_lista, nombre_completo, genero) VALUES
(1, 1, 'ACOSTA MATEOS ITZEL ALEJANDRA', 'M'),
(1, 2, 'AGUILAR CRISTERNA ARELI LUCIA', 'M'),
(1, 3, 'ALMANZA MORENO ADIR EMILIANO', 'H'),
(1, 4, 'ALVAREZ VAZQUEZ DAMIAN ALEJANDRO', 'H'),
(1, 5, 'BARRAZA GONZALEZ EDUARDO', 'H'),
(1, 6, 'CABRERA LOREDO EMILY AYLIN', 'M'),
(1, 7, 'CANTU GARCIA EYMI ALONDRA', 'M'),
(1, 8, 'CANTU TRIANA TADEO RAFAEL', 'H'),
(1, 9, 'DIMAS ARREOLA BRITTANY MARLEN', 'M'),
(1, 10, 'ESQUEDA BOTELLO XIMENA CECILIA', 'M'),
(1, 11, 'ESTRADA CRUZ VANESSA', 'M'),
(1, 12, 'FERNANDEZ MENDOZA BASTIAN DE JESUS', 'H'),
(1, 13, 'GARCÍA NAVARRO VALERIA ALEJANDRA', 'M'),
(1, 14, 'GARZA DE LEON MAGGIE AYLEEN', 'M'),
(1, 15, 'GONZALEZ DE LEON PADRON VALENTINA', 'M'),
(1, 16, 'IBARRA RODRIGUEZ  IVANNA NICOLE', 'M'),
(1, 17, 'LEAL MARTINEZ ESTEBAN ELIUTT', 'H'),
(1, 18, 'LOERA ALFARO VANESSA', 'M'),
(1, 19, 'MARTINEZ DE LA O ALLISON IVANNA', 'M'),
(1, 20, 'MORENO SANDOVAL SARAH CATALINA', 'M'),
(1, 21, 'OLACHEA BARRON MIA VALENTINA', 'M'),
(1, 22, 'PAZ CARRILLO MIRANDA ISABELA', 'M'),
(1, 23, 'PEÑA SANMIGUEL OWEN JARED', 'H'),
(1, 24, 'PEREZ ORTIZ NATASHA CAROLINA', 'M'),
(1, 25, 'PEREZ REYES EDHER ABISAI', 'H'),
(1, 26, 'PEREZ RODRÍGUEZ HANNAH VALERIA', 'M'),
(1, 27, 'RAMIREZ ABUNDIS RENATA ABIGAIL', 'M'),
(1, 28, 'RAMIREZ ALVAREZ ALEXIS DOMINIC', 'H'),
(1, 29, 'RAMOS OLLIVARY SARA MIA', 'M'),
(1, 30, 'RODRIGUEZ CARRANZA ANGEL MATEO', 'H'),
(1, 31, 'RODRIGUEZ DE LA CRUZ VICTORIA KATALINA ', 'M'),
(1, 32, 'RODRIGUEZ PADILLA CESAR', 'H'),
(1, 33, 'RODRIGUEZ SANCHEZ ALDO FABIAN', 'H'),
(1, 34, 'VALDEZ CRUZ EDUARDO', 'H'),
(1, 35, 'VAZQUEZ MORALES ANGEL DAMIAN', 'H');

-- 6. Insertar Calificaciones Diagnósticas Iniciales
INSERT INTO calificaciones_periodo (id_alumno, periodo, lenguajes, saberes_pensamiento, etica_naturaleza, de_lo_humano, promedio_periodo) VALUES
(1, 'DIAGNOSTICO', 7.5, 7.0, 8.0, 8.5, 7.8),
(2, 'DIAGNOSTICO', 9.5, 9.0, 9.2, 9.5, 9.3),
(3, 'DIAGNOSTICO', 7.5, 7.2, 7.8, 8.0, 7.6),
(4, 'DIAGNOSTICO', 6.5, 6.0, 6.8, 7.0, 6.6),
(5, 'DIAGNOSTICO', 5.5, 5.2, 5.8, 6.0, 5.6);

-- 7. Insertar Ponderaciones de Evaluación (Hoja 2 del Excel original)
INSERT INTO ponderaciones_periodo (id_alumno, periodo, examen, tareas, trabajos, muestreos, proyectos, participacion, disciplina) VALUES
(1, 'DIAGNOSTICO', 20.0, 0.0, 0.0, 0.0, 6.0, 10.0, 10.0),
(2, 'DIAGNOSTICO', 18.0, 22.0, 27.0, 3.0, 5.0, 9.0, 10.0),
(3, 'DIAGNOSTICO', 14.0, 18.0, 20.0, 2.0, 4.0, 8.0, 8.0),
(4, 'DIAGNOSTICO', 11.0, 15.0, 18.0, 1.0, 3.0, 6.0, 7.0),
(5, 'DIAGNOSTICO', 8.0, 10.0, 12.0, 1.0, 2.0, 5.0, 6.0);

-- =============================================================================
-- VISTAS SQL PARA CONSULTAS RÁPIDAS EN MYSQL WORKBENCH
-- =============================================================================

-- Vista para ver el concentrado escolar con nombres, género y promedio
CREATE OR REPLACE VIEW vista_concentrado_diagnostico AS
SELECT 
  a.numero_lista AS 'No.',
  a.nombre_completo AS 'Alumno',
  a.genero AS 'Género',
  c.lenguajes AS 'Lenguajes',
  c.saberes_pensamiento AS 'Saberes y Pens.',
  c.etica_naturaleza AS 'Ética y Soc.',
  c.de_lo_humano AS 'De lo Humano',
  ROUND((COALESCE(c.lenguajes,0) + COALESCE(c.saberes_pensamiento,0) + COALESCE(c.etica_naturaleza,0) + COALESCE(c.de_lo_humano,0)) / 4, 1) AS 'Promedio Final'
FROM alumnos a
LEFT JOIN calificaciones_periodo c ON a.id_alumno = c.id_alumno AND c.periodo = 'DIAGNOSTICO'
ORDER BY a.numero_lista ASC;

-- Vista para ver alumnos que requieren apoyo (Promedio menor a 6.0)
CREATE OR REPLACE VIEW vista_alumnos_en_riesgo AS
SELECT 
  a.numero_lista,
  a.nombre_completo,
  c.periodo,
  c.promedio_periodo
FROM alumnos a
JOIN calificaciones_periodo c ON a.id_alumno = c.id_alumno
WHERE c.promedio_periodo < 6.0;
