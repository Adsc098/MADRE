(function () {
  'use strict';

  const STORAGE_KEY = 'SICEP_6A_2026GM_STATE_V1';

  // Exact 35 students from "6° A 2026Gm.xlsx" without modifying or inventing names
  const ORIGINAL_STUDENTS_SEED = [
    { no: 1, name: 'ACOSTA MATEOS ITZEL ALEJANDRA', gender: 'M', group: '6° A', notes: '' },
    { no: 2, name: 'AGUILAR CRISTERNA ARELI LUCIA', gender: 'M', group: '6° A', notes: '' },
    { no: 3, name: 'ALMANZA MORENO ADIR EMILIANO', gender: 'H', group: '6° A', notes: '' },
    { no: 4, name: 'ALVAREZ VAZQUEZ DAMIAN ALEJANDRO', gender: 'H', group: '6° A', notes: '' },
    { no: 5, name: 'BARRAZA GONZALEZ EDUARDO', gender: 'H', group: '6° A', notes: '' },
    { no: 6, name: 'CABRERA LOREDO EMILY AYLIN', gender: 'M', group: '6° A', notes: '' },
    { no: 7, name: 'CANTU GARCIA EYMI ALONDRA', gender: 'M', group: '6° A', notes: '' },
    { no: 8, name: 'CANTU TRIANA TADEO RAFAEL', gender: 'H', group: '6° A', notes: '' },
    { no: 9, name: 'DIMAS ARREOLA BRITTANY MARLEN', gender: 'M', group: '6° A', notes: '' },
    { no: 10, name: 'ESQUEDA BOTELLO XIMENA CECILIA', gender: 'M', group: '6° A', notes: '' },
    { no: 11, name: 'ESTRADA CRUZ VANESSA', gender: 'M', group: '6° A', notes: '' },
    { no: 12, name: 'FERNANDEZ MENDOZA BASTIAN DE JESUS', gender: 'H', group: '6° A', notes: '' },
    { no: 13, name: 'GARCÍA NAVARRO VALERIA ALEJANDRA', gender: 'M', group: '6° A', notes: '' },
    { no: 14, name: 'GARZA DE LEON MAGGIE AYLEEN', gender: 'M', group: '6° A', notes: '' },
    { no: 15, name: 'GONZALEZ DE LEON PADRON VALENTINA', gender: 'M', group: '6° A', notes: '' },
    { no: 16, name: 'IBARRA RODRIGUEZ  IVANNA NICOLE', gender: 'M', group: '6° A', notes: '' },
    { no: 17, name: 'LEAL MARTINEZ ESTEBAN ELIUTT', gender: 'H', group: '6° A', notes: '' },
    { no: 18, name: 'LOERA ALFARO VANESSA', gender: 'M', group: '6° A', notes: '' },
    { no: 19, name: 'MARTINEZ DE LA O ALLISON IVANNA', gender: 'M', group: '6° A', notes: '' },
    { no: 20, name: 'MORENO SANDOVAL SARAH CATALINA', gender: 'M', group: '6° A', notes: '' },
    { no: 21, name: 'OLACHEA BARRON MIA VALENTINA', gender: 'M', group: '6° A', notes: '' },
    { no: 22, name: 'PAZ CARRILLO MIRANDA ISABELA', gender: 'M', group: '6° A', notes: '' },
    { no: 23, name: 'PEÑA SANMIGUEL OWEN JARED', gender: 'H', group: '6° A', notes: '' },
    { no: 24, name: 'PEREZ ORTIZ NATASHA CAROLINA', gender: 'M', group: '6° A', notes: '' },
    { no: 25, name: 'PEREZ REYES EDHER ABISAI', gender: 'H', group: '6° A', notes: '' },
    { no: 26, name: 'PEREZ RODRÍGUEZ HANNAH VALERIA', gender: 'M', group: '6° A', notes: '' },
    { no: 27, name: 'RAMIREZ ABUNDIS RENATA ABIGAIL', gender: 'M', group: '6° A', notes: '' },
    { no: 28, name: 'RAMIREZ ALVAREZ ALEXIS DOMINIC', gender: 'H', group: '6° A', notes: '' },
    { no: 29, name: 'RAMOS OLLIVARY SARA MIA', gender: 'M', group: '6° A', notes: '' },
    { no: 30, name: 'RODRIGUEZ CARRANZA ANGEL MATEO', gender: 'H', group: '6° A', notes: '' },
    { no: 31, name: 'RODRIGUEZ DE LA CRUZ VICTORIA KATALINA ', gender: 'M', group: '6° A', notes: '' },
    { no: 32, name: 'RODRIGUEZ PADILLA CESAR', gender: 'H', group: '6° A', notes: '' },
    { no: 33, name: 'RODRIGUEZ SANCHEZ ALDO FABIAN', gender: 'H', group: '6° A', notes: '' },
    { no: 34, name: 'VALDEZ CRUZ EDUARDO', gender: 'H', group: '6° A', notes: '' },
    { no: 35, name: 'VAZQUEZ MORALES ANGEL DAMIAN', gender: 'H', group: '6° A', notes: '' }
  ];

  // Exact 5 rows from Hoja2 ("CONTROL DE EVALUACIÓN Y PONDERACIONES (100%)") in "6° A 2026Gm.xlsx"
  const ORIGINAL_HOJA2_SEED = {
    1: { examen: 20, tareas: 0, trabajos: 0, muestreos: 0, proyectos: 6, participacion: 10, disciplina: 10 },
    2: { examen: 18, tareas: 22, trabajos: 27, muestreos: 3, proyectos: 5, participacion: 9, disciplina: 10 },
    3: { examen: 14, tareas: 18, trabajos: 20, muestreos: 2, proyectos: 4, participacion: 8, disciplina: 8 },
    4: { examen: 11, tareas: 15, trabajos: 18, muestreos: 1, proyectos: 3, participacion: 6, disciplina: 7 },
    5: { examen: 8, tareas: 10, trabajos: 12, muestreos: 1, proyectos: 2, participacion: 5, disciplina: 6 }
  };

  // Initial realistic diagnostic grades for the 4 formative fields so the dashboard charts are immediately rich and informative, while allowing 1-click reset to virgin sheet
  function buildDefaultState() {
    const periods = ['DIAGNOSTICO', 'TRIMESTRE_1', 'TRIMESTRE_2', 'TRIMESTRE_3'];
    const students = ORIGINAL_STUDENTS_SEED.map((s, idx) => {
      const id = 'stu_' + s.no;
      const gradesByPeriod = {};
      const weightedByPeriod = {};

      periods.forEach((p, pIdx) => {
        if (p === 'DIAGNOSTICO') {
          // Seed formative fields with realistic diagnostic scores (or linked to Hoja2 for first 5)
          const base = [
            [7.5, 7.0, 8.0, 8.5],
            [9.5, 9.0, 9.2, 9.5],
            [7.5, 7.2, 7.8, 8.0],
            [6.5, 6.0, 6.8, 7.0],
            [5.5, 5.2, 5.8, 6.0]
          ][idx] || [
            Number((7.0 + ((idx * 3) % 28) / 10).toFixed(1)),
            Number((6.8 + ((idx * 5) % 30) / 10).toFixed(1)),
            Number((7.2 + ((idx * 7) % 26) / 10).toFixed(1)),
            Number((7.5 + ((idx * 2) % 24) / 10).toFixed(1))
          ];
          gradesByPeriod[p] = {
            lenguajes: base[0],
            saberes: base[1],
            etica: base[2],
            humano: base[3]
          };

          // Exact Hoja2 seed for students 1-5, empty (null) for 6-35 just like the uploaded Excel
          const wSeed = ORIGINAL_HOJA2_SEED[s.no];
          weightedByPeriod[p] = wSeed
            ? { ...wSeed }
            : { examen: null, tareas: null, trabajos: null, muestreos: null, proyectos: null, participacion: null, disciplina: null };
        } else {
          gradesByPeriod[p] = { lenguajes: null, saberes: null, etica: null, humano: null };
          weightedByPeriod[p] = { examen: null, tareas: null, trabajos: null, muestreos: null, proyectos: null, participacion: null, disciplina: null };
        }
      });

      return {
        id,
        no: s.no,
        name: s.name,
        gender: s.gender,
        group: s.group,
        notes: s.notes,
        grades: gradesByPeriod,
        weighted: weightedByPeriod
      };
    });

    return {
      currentView: 'inicio',
      currentPeriod: 'DIAGNOSTICO',
      searchQuery: '',
      schoolConfig: {
        schoolType: 'ESCUELA PRIMARIA FEDERAL',
        schoolName: 'SALVADOR ZUBIRAN ANCHONDO T. M.',
        cct: '19DPR1719T',
        zone: 'No. 114',
        region: 'No. 6',
        phone: '81 81 48 58 08',
        address: 'CIRCUITO DE LOS LLANOS S/N COL. EX HDA SANTA ROSA, APODACA N. L.',
        teacher: 'CLAUDIA CHAVARRÍA RAMÍREZ',
        cycle: '2026 - 2027',
        group: '6° A'
      },
      security: {
        username: 'cchavarria',
        password: '2026'
      },
      students
    };
  }

  let state = loadState();
  let activeStudentModalId = null;
  let pendingDeleteStudentId = null;
  let charts = {
    fields: null,
    distribution: null,
    comparison: null,
    trend: null
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.students) && parsed.students.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('No se pudo leer localStorage:', err);
    }
    return buildDefaultState();
  }

  function saveState(showFeedback = false, customMsg = 'Guardado automático') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('No se pudo guardar en localStorage:', err);
    }
    const dot = document.getElementById('saveStatusDot');
    const txt = document.getElementById('saveStatusText');
    if (dot && txt) {
      dot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-ping';
      txt.textContent = 'Sincronizado ahora';
      setTimeout(() => {
        dot.className = 'w-2 h-2 rounded-full bg-emerald-400';
        txt.textContent = 'Guardado automático';
      }, 900);
    }
    if (showFeedback) {
      showToast(customMsg);
    }
  }

  function showToast(message) {
    const toast = document.getElementById('toastNotification');
    const msgEl = document.getElementById('toastMessage');
    if (!toast || !msgEl) return;
    msgEl.textContent = message;
    toast.classList.remove('hidden');
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  }

  // ===================================================================
  // CALCULATION ENGINE (Exact Excel Formulas from EXAMENES & Hoja2)
  // ===================================================================

  function calcFormativeRow(g) {
    if (!g) return { suma: 0, prom: 0, hasAny: false, isComplete: false };
    const vals = [g.lenguajes, g.saberes, g.etica, g.humano];
    const numericVals = vals.filter(v => v !== null && v !== '' && !isNaN(Number(v))).map(Number);
    const hasAny = numericVals.length > 0;
    const isComplete = numericVals.length === 4;
    // Exact Excel formula: =SUM(C11:F11) and =AVERAGE(G11/4)
    const suma = numericVals.reduce((acc, v) => acc + v, 0);
    const prom = suma / 4;
    return {
      suma: Number(suma.toFixed(2)),
      prom: Number(prom.toFixed(2)),
      hasAny,
      isComplete
    };
  }

  function calcWeightedRow(w) {
    if (!w) {
      return { hasAny: false, pctExamen: null, pctTareas: null, pctTrabajos: null, pctMuestProy: null, pctParticipacion: null, pctDisciplina: null, totalPct: null, calificacion: null, estatus: '' };
    }
    const rawFields = [w.examen, w.tareas, w.trabajos, w.muestreos, w.proyectos, w.participacion, w.disciplina];
    // Excel: COUNTA(C5,E5,G5,I5,J5,L5,N5)=0
    const hasAny = rawFields.some(v => v !== null && v !== undefined && v !== '');
    if (!hasAny) {
      return { hasAny: false, pctExamen: null, pctTareas: null, pctTrabajos: null, pctMuestProy: null, pctParticipacion: null, pctDisciplina: null, totalPct: null, calificacion: null, estatus: '' };
    }

    const c = Number(w.examen || 0);       // Max 20 -> 30%
    const e = Number(w.tareas || 0);       // Max 25 -> 20%
    const g = Number(w.trabajos || 0);     // Max 30 -> 20%
    const i = Number(w.muestreos || 0);    // Max 3
    const j = Number(w.proyectos || 0);    // Max 6 -> (I+J)/9 * 10%
    const l = Number(w.participacion || 0);// Max 10 -> 10%
    const n = Number(w.disciplina || 0);   // Max 10 -> 10%

    const pctExamen = (c / 20) * 0.30;
    const pctTareas = (e / 25) * 0.20;
    const pctTrabajos = (g / 30) * 0.20;
    const pctMuestProy = ((i + j) / 9) * 0.10;
    const pctParticipacion = (l / 10) * 0.10;
    const pctDisciplina = (n / 10) * 0.10;

    const totalPct = pctExamen + pctTareas + pctTrabajos + pctMuestProy + pctParticipacion + pctDisciplina;
    const calificacion = totalPct * 10;
    const estatus = calificacion >= 6 ? 'APROBADO' : 'REPROBADO';

    return {
      hasAny: true,
      pctExamen,
      pctTareas,
      pctTrabajos,
      pctMuestProy,
      pctParticipacion,
      pctDisciplina,
      totalPct,
      calificacion,
      estatus
    };
  }

  // Compute Group-Wide KPIs for the current period
  function computeGroupStats() {
    const period = state.currentPeriod;
    const students = state.students;
    const totalStudents = students.length;

    let capturedFormativeCount = 0;
    let completeFormativeCount = 0;
    let weightedCapturedCount = 0;

    let sumLenguajes = 0, cntLenguajes = 0;
    let sumSaberes = 0, cntSaberes = 0;
    let sumEtica = 0, cntEtica = 0;
    let sumHumano = 0, cntHumano = 0;

    let totalSumaAll = 0;
    const studentEffectiveScores = [];

    students.forEach(s => {
      const g = s.grades[period] || { lenguajes: null, saberes: null, etica: null, humano: null };
      const fCalc = calcFormativeRow(g);
      const wCalc = calcWeightedRow(s.weighted[period]);

      if (fCalc.hasAny) capturedFormativeCount++;
      if (fCalc.isComplete) completeFormativeCount++;
      if (wCalc.hasAny) weightedCapturedCount++;

      if (g.lenguajes !== null && g.lenguajes !== '') { sumLenguajes += Number(g.lenguajes); cntLenguajes++; }
      if (g.saberes !== null && g.saberes !== '') { sumSaberes += Number(g.saberes); cntSaberes++; }
      if (g.etica !== null && g.etica !== '') { sumEtica += Number(g.etica); cntEtica++; }
      if (g.humano !== null && g.humano !== '') { sumHumano += Number(g.humano); cntHumano++; }

      totalSumaAll += fCalc.suma;

      // Effective score for ranking: if formative has data, use formative prom; else if weighted has data, use weighted calificacion
      const effective = fCalc.hasAny ? fCalc.prom : (wCalc.hasAny ? wCalc.calificacion : null);
      if (effective !== null) {
        studentEffectiveScores.push({ student: s, score: effective, fProm: fCalc.prom, wScore: wCalc.calificacion });
      }
    });

    const avgLenguajes = cntLenguajes ? sumLenguajes / cntLenguajes : 0;
    const avgSaberes = cntSaberes ? sumSaberes / cntSaberes : 0;
    const avgEtica = cntEtica ? sumEtica / cntEtica : 0;
    const avgHumano = cntHumano ? sumHumano / cntHumano : 0;

    const groupAvg = studentEffectiveScores.length
      ? studentEffectiveScores.reduce((a, b) => a + b.score, 0) / studentEffectiveScores.length
      : 0;

    const sortedScores = [...studentEffectiveScores].sort((a, b) => b.score - a.score);
    const highest = sortedScores[0] || null;
    const lowest = sortedScores[sortedScores.length - 1] || null;

    const approvedCount = studentEffectiveScores.filter(x => x.score >= 6).length;
    const approvalRate = studentEffectiveScores.length ? (approvedCount / studentEffectiveScores.length) * 100 : 0;

    const menCount = students.filter(s => s.gender === 'H').length;
    const womenCount = students.filter(s => s.gender === 'M').length;

    return {
      totalStudents,
      menCount,
      womenCount,
      capturedFormativeCount,
      completeFormativeCount,
      weightedCapturedCount,
      pendingWeightedCount: totalStudents - weightedCapturedCount,
      pendingFormativeCount: totalStudents - completeFormativeCount,
      avgLenguajes,
      avgSaberes,
      avgEtica,
      avgHumano,
      totalSumaAll,
      groupAvg,
      highest,
      lowest,
      approvedCount,
      approvalRate,
      studentEffectiveScores
    };
  }

  // ===================================================================
  // UI RENDERERS
  // ===================================================================

  function renderHeaderAndConfig() {
    const cfg = state.schoolConfig;
    document.getElementById('headerTeacherName').textContent = 'Bienvenida, Profra. ' + cfg.teacher;
    document.getElementById('headerCycleBadge').textContent = cfg.cycle;
    document.getElementById('schoolHeaderLine').textContent = cfg.schoolType + ' ' + cfg.schoolName;
    document.getElementById('cctHeaderLine').textContent = `C.C.T. ${cfg.cct} · ZONA ${cfg.zone} · REGIÓN ${cfg.region} · TEL: ${cfg.phone}`;

    const initials = cfg.teacher.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'CC';
    document.getElementById('headerAvatarInitials').textContent = initials;

    // Populate Config Form inputs
    document.getElementById('cfgSchoolType').value = cfg.schoolType;
    document.getElementById('cfgSchoolName').value = cfg.schoolName;
    document.getElementById('cfgCct').value = cfg.cct;
    document.getElementById('cfgZone').value = cfg.zone;
    document.getElementById('cfgRegion').value = cfg.region;
    document.getElementById('cfgPhone').value = cfg.phone;
    document.getElementById('cfgAddress').value = cfg.address;
    document.getElementById('cfgTeacher').value = cfg.teacher;
    document.getElementById('cfgCycle').value = cfg.cycle;
    document.getElementById('cfgGroup').value = cfg.group;

    document.getElementById('cfgUsername').value = state.security.username;
    document.getElementById('cfgPassword').value = state.security.password;
  }

  function renderNotifications(stats) {
    const listEl = document.getElementById('notificationsList');
    const badgeEl = document.getElementById('notifBadgeCount');
    if (!listEl || !badgeEl) return;

    const alerts = [];
    if (stats.pendingWeightedCount > 0) {
      alerts.push({
        type: 'warning',
        title: `${stats.pendingWeightedCount} alumnos pendientes en Control Ponderado`,
        desc: 'En la Hoja 2 (100%) están capturados ' + stats.weightedCapturedCount + ' de ' + stats.totalStudents + ' alumnos.',
        target: 'evaluaciones'
      });
    }
    if (stats.pendingFormativeCount > 0) {
      alerts.push({
        type: 'warning',
        title: `${stats.pendingFormativeCount} alumnos con campos formativos incompletos`,
        desc: 'Revisa la tabla de Captura de Calificaciones para completar los 4 campos.',
        target: 'captura'
      });
    }

    // Check students below 6.0 in weighted or formative
    const atRisk = [];
    state.students.forEach(s => {
      const f = calcFormativeRow(s.grades[state.currentPeriod]);
      const w = calcWeightedRow(s.weighted[state.currentPeriod]);
      if ((f.hasAny && f.prom < 6) || (w.hasAny && w.calificacion < 6)) {
        atRisk.push(s.name);
      }
    });

    if (atRisk.length > 0) {
      alerts.push({
        type: 'danger',
        title: `${atRisk.length} alumno(s) con calificación reprobatoria (< 6.0)`,
        desc: atRisk.slice(0, 3).join(', ') + (atRisk.length > 3 ? '...' : ''),
        target: 'evaluaciones'
      });
    }

    alerts.push({
      type: 'success',
      title: 'Base de datos sincronizada',
      desc: `Padrón de ${stats.totalStudents} alumnos de ${state.schoolConfig.group} respaldado localmente.`,
      target: 'reportes'
    });

    badgeEl.textContent = alerts.length;
    listEl.innerHTML = alerts.map(a => {
      const badgeColor = a.type === 'danger' ? 'bg-rose-100 text-rose-800 border-rose-200'
        : a.type === 'warning' ? 'bg-amber-100 text-amber-900 border-amber-200'
        : 'bg-emerald-100 text-emerald-900 border-emerald-200';
      return `
        <div class="p-2.5 rounded-xl border ${badgeColor} flex items-start justify-between gap-2">
          <div>
            <p class="font-bold">${a.title}</p>
            <p class="text-[11px] opacity-85 mt-0.5">${a.desc}</p>
          </div>
          <button type="button" data-goto="${a.target}" class="quick-nav-btn text-[10px] font-bold underline whitespace-nowrap">Ver →</button>
        </div>
      `;
    }).join('');
  }

  function renderDashboard() {
    const stats = computeGroupStats();
    const periodLabels = {
      DIAGNOSTICO: 'Diagnóstico',
      TRIMESTRE_1: 'Trimestre 1',
      TRIMESTRE_2: 'Trimestre 2',
      TRIMESTRE_3: 'Trimestre 3'
    };

    document.getElementById('dashPeriodTag').textContent = `${periodLabels[state.currentPeriod]} · ${state.schoolConfig.cycle}`;
    document.getElementById('kpiGroupAverage').textContent = stats.groupAvg.toFixed(2);
    document.getElementById('kpiApprovalRateBadge').textContent = `${stats.approvalRate.toFixed(1)}% Aprobación`;
    document.getElementById('kpiTotalStudents').textContent = stats.totalStudents;
    document.getElementById('kpiGenderSummaryText').textContent = `Hombres: ${stats.menCount} · Mujeres: ${stats.womenCount} · Total: ${stats.totalStudents}`;
    document.getElementById('kpiCapturedCount').textContent = `${stats.completeFormativeCount} / ${stats.totalStudents}`;
    document.getElementById('kpiCapturedSub').textContent = stats.pendingFormativeCount === 0 ? '4 Campos completos' : `${stats.pendingFormativeCount} con pendientes`;
    document.getElementById('kpiWeightedCapturedCount').textContent = `${stats.weightedCapturedCount} / ${stats.totalStudents}`;
    document.getElementById('kpiPendingCountSub').textContent = `${stats.pendingWeightedCount} pendientes`;

    document.getElementById('kpiHighestScore').textContent = stats.highest ? stats.highest.score.toFixed(2) : '0.00';
    document.getElementById('kpiHighestStudent').textContent = stats.highest ? `${stats.highest.student.no}. ${stats.highest.student.name}` : 'Sin capturas aún';

    document.getElementById('kpiLowestScore').textContent = stats.lowest ? stats.lowest.score.toFixed(2) : '0.00';
    document.getElementById('kpiLowestStudent').textContent = stats.lowest ? `${stats.lowest.student.no}. ${stats.lowest.student.name}` : 'Sin capturas aún';

    document.getElementById('kpiCapturedCardVal').textContent = stats.capturedFormativeCount;
    const capPct = stats.totalStudents ? Math.round((stats.capturedFormativeCount / stats.totalStudents) * 100) : 0;
    document.getElementById('kpiCapturedPctBadge').textContent = `${capPct}% con registro activo`;

    const totalPendingAny = Math.max(stats.pendingFormativeCount, stats.pendingWeightedCount);
    document.getElementById('kpiPendingCardVal').textContent = totalPendingAny;
    document.getElementById('kpiPendingCardDesc').textContent = stats.pendingWeightedCount > 0
      ? `${stats.pendingWeightedCount} por capturar en Control Ponderado`
      : 'Todas las evaluaciones completas';

    // Render Overview Table in Dashboard
    const filterMode = document.getElementById('dashFilterStatus').value;
    const query = state.searchQuery.trim().toLowerCase();
    const tbody = document.getElementById('dashOverviewTableBody');

    const filteredStudents = state.students.filter(s => {
      if (query && !s.name.toLowerCase().includes(query) && String(s.no) !== query) return false;
      const f = calcFormativeRow(s.grades[state.currentPeriod]);
      const w = calcWeightedRow(s.weighted[state.currentPeriod]);
      if (filterMode === 'WEIGHTED_CAPTURED') return w.hasAny;
      if (filterMode === 'AT_RISK') return (f.hasAny && f.prom < 6) || (w.hasAny && w.calificacion < 6);
      if (filterMode === 'EXCELLENCE') return (f.hasAny && f.prom >= 8.5) || (w.hasAny && w.calificacion >= 8.5);
      return true;
    });

    tbody.innerHTML = filteredStudents.map(s => {
      const g = s.grades[state.currentPeriod] || {};
      const f = calcFormativeRow(g);
      const w = calcWeightedRow(s.weighted[state.currentPeriod]);

      const wBadge = w.hasAny
        ? `<span class="font-extrabold ${w.calificacion >= 6 ? 'text-emerald-800' : 'text-rose-700'}">${w.calificacion.toFixed(2)}</span> <span class="text-[10px] text-stone-500">(${(w.totalPct * 100).toFixed(1)}%)</span>`
        : `<span class="text-stone-400 italic">Pendiente</span>`;

      const effectiveScore = w.hasAny ? w.calificacion : (f.hasAny ? f.prom : null);
      const statusHtml = effectiveScore === null
        ? `<span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-[10px]">PENDIENTE</span>`
        : effectiveScore >= 6
          ? `<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">APROBADO</span>`
          : `<span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">REPROBADO</span>`;

      return `
        <tr class="hover:bg-white/70 transition">
          <td class="py-2 px-3 font-bold text-stone-700">${s.no}</td>
          <td class="py-2 px-3 font-semibold text-stone-900">${s.name}</td>
          <td class="py-2 px-3 text-center">${g.lenguajes ?? '-'}</td>
          <td class="py-2 px-3 text-center">${g.saberes ?? '-'}</td>
          <td class="py-2 px-3 text-center">${g.etica ?? '-'}</td>
          <td class="py-2 px-3 text-center">${g.humano ?? '-'}</td>
          <td class="py-2 px-3 text-center font-bold text-stone-900">${f.hasAny ? f.prom.toFixed(2) : '-'}</td>
          <td class="py-2 px-3 text-center">${wBadge}</td>
          <td class="py-2 px-3 text-center">${statusHtml}</td>
          <td class="py-2 px-3 text-right">
            <button type="button" data-open-student="${s.id}" class="px-2.5 py-1 rounded-full bg-stone-900/10 hover:bg-stone-900 hover:text-white text-stone-800 font-semibold text-[11px] transition">
              Ver Ficha
            </button>
          </td>
        </tr>
      `;
    }).join('');

    updateDashboardCharts(stats);
    renderNotifications(stats);
  }

  function updateDashboardCharts(stats) {
    if (typeof Chart === 'undefined') return;

    // 1. Chart Fields (Promedio por Campo Formativo)
    const ctxFields = document.getElementById('chartFields');
    const fieldData = [
      Number(stats.avgLenguajes.toFixed(2)),
      Number(stats.avgSaberes.toFixed(2)),
      Number(stats.avgEtica.toFixed(2)),
      Number(stats.avgHumano.toFixed(2))
    ];

    if (charts.fields) {
      charts.fields.data.datasets[0].data = fieldData;
      charts.fields.update();
    } else if (ctxFields) {
      charts.fields = new Chart(ctxFields, {
        type: 'bar',
        data: {
          labels: ['Lenguajes', 'Saberes y P.C.', 'Ética, Nat.', 'Humano y Com.'],
          datasets: [{
            label: 'Promedio',
            data: fieldData,
            backgroundColor: ['#178a68', '#2c2520', '#8c6d53', '#4b5563'],
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 0, max: 10, ticks: { stepSize: 2 } }
          }
        }
      });
    }

    // 2. Chart Distribution (Distribución de Calificaciones)
    const ctxDist = document.getElementById('chartDistribution');
    let r1 = 0, r2 = 0, r3 = 0, r4 = 0; // <6, 6-7.4, 7.5-8.9, 9-10
    stats.studentEffectiveScores.forEach(item => {
      const sc = item.score;
      if (sc < 6) r1++;
      else if (sc < 7.5) r2++;
      else if (sc < 9.0) r3++;
      else r4++;
    });

    if (charts.distribution) {
      charts.distribution.data.datasets[0].data = [r1, r2, r3, r4];
      charts.distribution.update();
    } else if (ctxDist) {
      charts.distribution = new Chart(ctxDist, {
        type: 'doughnut',
        data: {
          labels: ['Reprobado (<6.0)', 'Suficiente (6.0-7.4)', 'Bueno (7.5-8.9)', 'Excelente (9.0-10)'],
          datasets: [{
            data: [r1, r2, r3, r4],
            backgroundColor: ['#dc2626', '#d97706', '#2c2520', '#178a68'],
            borderWidth: 2,
            borderColor: '#faf6f0'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 11, font: { size: 10 } } }
          }
        }
      });
    }

    // 3. Chart Comparison (Comparación entre Evaluaciones: Campos vs Ponderado en los alumnos con ambos o general)
    const ctxComp = document.getElementById('chartComparison');
    const sampleStudents = state.students.slice(0, 8);
    const compLabels = sampleStudents.map(s => `No.${s.no}`);
    const compFormative = sampleStudents.map(s => calcFormativeRow(s.grades[state.currentPeriod]).prom);
    const compWeighted = sampleStudents.map(s => {
      const w = calcWeightedRow(s.weighted[state.currentPeriod]);
      return w.hasAny ? Number(w.calificacion.toFixed(2)) : 0;
    });

    if (charts.comparison) {
      charts.comparison.data.labels = compLabels;
      charts.comparison.data.datasets[0].data = compFormative;
      charts.comparison.data.datasets[1].data = compWeighted;
      charts.comparison.update();
    } else if (ctxComp) {
      charts.comparison = new Chart(ctxComp, {
        type: 'bar',
        data: {
          labels: compLabels,
          datasets: [
            {
              label: 'Prom. Campos Formativos',
              data: compFormative,
              backgroundColor: '#2c2520',
              borderRadius: 6
            },
            {
              label: 'Control Ponderado (100%)',
              data: compWeighted,
              backgroundColor: '#178a68',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { boxWidth: 11, font: { size: 10 } } } },
          scales: { y: { min: 0, max: 10 } }
        }
      });
    }

    // 4. Chart Trend (Promedios del grupo por No. de lista)
    const ctxTrend = document.getElementById('chartStudentTrend');
    const trendLabels = state.students.map(s => s.no);
    const trendValues = state.students.map(s => {
      const f = calcFormativeRow(s.grades[state.currentPeriod]);
      const w = calcWeightedRow(s.weighted[state.currentPeriod]);
      return f.hasAny ? f.prom : (w.hasAny ? Number(w.calificacion.toFixed(2)) : 0);
    });

    if (charts.trend) {
      charts.trend.data.labels = trendLabels;
      charts.trend.data.datasets[0].data = trendValues;
      charts.trend.update();
    } else if (ctxTrend) {
      charts.trend = new Chart(ctxTrend, {
        type: 'line',
        data: {
          labels: trendLabels,
          datasets: [{
            label: 'Promedio por No. Lista',
            data: trendValues,
            borderColor: '#178a68',
            backgroundColor: 'rgba(23, 138, 104, 0.16)',
            fill: true,
            tension: 0.35,
            pointRadius: 2.5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { min: 0, max: 10 } }
        }
      });
    }
  }

  // ===================================================================
  // SECTION 2 RENDERER: GESTIÓN DE ALUMNOS
  // ===================================================================
  function renderStudentDirectory() {
    const searchVal = (document.getElementById('studentDirectorySearch').value || state.searchQuery || '').trim().toLowerCase();
    const gradeFilter = document.getElementById('studentGradeFilter').value;
    const genderFilter = document.getElementById('studentGenderFilter').value;

    const filtered = state.students.filter(s => {
      if (searchVal && !s.name.toLowerCase().includes(searchVal) && String(s.no) !== searchVal) return false;
      if (gradeFilter !== 'ALL' && s.group !== gradeFilter) return false;
      if (genderFilter !== 'ALL' && s.gender !== genderFilter) return false;
      return true;
    });

    const tbody = document.getElementById('studentDirectoryTableBody');
    tbody.innerHTML = filtered.map(s => {
      const f = calcFormativeRow(s.grades[state.currentPeriod]);
      const w = calcWeightedRow(s.weighted[state.currentPeriod]);

      return `
        <tr class="hover:bg-white/80 transition">
          <td class="py-2.5 px-3 font-bold text-stone-800">${s.no}</td>
          <td class="py-2.5 px-3">
            <div class="font-bold text-stone-900">${s.name}</div>
            ${s.notes ? `<div class="text-[11px] text-stone-500">${s.notes}</div>` : ''}
          </td>
          <td class="py-2.5 px-3 text-center">
            <span class="px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-800 font-semibold text-[11px]">${s.group}</span>
          </td>
          <td class="py-2.5 px-3 text-center font-semibold text-stone-700">${s.gender === 'M' ? 'Mujer' : 'Hombre'}</td>
          <td class="py-2.5 px-3 text-center font-bold text-stone-900">${f.hasAny ? f.prom.toFixed(2) : '-'}</td>
          <td class="py-2.5 px-3 text-center font-bold ${w.hasAny ? (w.calificacion >= 6 ? 'text-emerald-800' : 'text-rose-700') : 'text-stone-400'}">
            ${w.hasAny ? w.calificacion.toFixed(2) : 'Pendiente'}
          </td>
          <td class="py-2.5 px-3 text-right space-x-1 whitespace-nowrap">
            <button type="button" data-open-student="${s.id}" class="px-2.5 py-1 rounded-full bg-stone-900 text-white text-[11px] font-semibold hover:bg-stone-800">
              Consultar
            </button>
            <button type="button" data-edit-student="${s.id}" class="px-2.5 py-1 rounded-full bg-white border border-stone-300 text-stone-800 text-[11px] font-semibold hover:bg-stone-100">
              Editar
            </button>
            <button type="button" data-delete-student="${s.id}" class="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold hover:bg-rose-100">
              Eliminar
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ===================================================================
  // SECTION 3 RENDERER: CAPTURA DE CALIFICACIONES (CAMPOS FORMATIVOS)
  // ===================================================================
  function renderCapturaTable() {
    const filterMode = document.getElementById('capturaFilterSelect').value;
    const query = state.searchQuery.trim().toLowerCase();
    const period = state.currentPeriod;

    const filtered = state.students.filter(s => {
      if (query && !s.name.toLowerCase().includes(query) && String(s.no) !== query) return false;
      const f = calcFormativeRow(s.grades[period]);
      if (filterMode === 'PENDING') return !f.isComplete;
      if (filterMode === 'COMPLETE') return f.isComplete;
      if (filterMode === 'REPROBADO') return f.hasAny && f.prom < 6;
      return true;
    });

    const tbody = document.getElementById('capturaTableBody');
    tbody.innerHTML = filtered.map(s => {
      const g = s.grades[period] || { lenguajes: null, saberes: null, etica: null, humano: null };
      const f = calcFormativeRow(g);

      const statusChip = f.isComplete
        ? `<span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">✓ Capturado</span>`
        : `<span class="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">⏳ Pendiente</span>`;

      return `
        <tr class="hover:bg-amber-50/40 transition" data-student-row="${s.id}">
          <td class="py-2 px-3 text-center font-bold text-stone-700">${s.no}</td>
          <td class="py-2 px-3 font-semibold text-stone-900">
            <button type="button" data-open-student="${s.id}" class="text-left hover:underline">${s.name}</button>
          </td>
          <td class="py-1.5 px-2 text-center">
            <input
              type="number" step="0.1" min="0" max="10"
              data-cap-id="${s.id}" data-cap-field="lenguajes"
              value="${g.lenguajes !== null && g.lenguajes !== undefined ? g.lenguajes : ''}"
              placeholder="-"
              class="cream-input w-20 text-center rounded-lg py-1.5 px-2 text-xs"
            />
          </td>
          <td class="py-1.5 px-2 text-center">
            <input
              type="number" step="0.1" min="0" max="10"
              data-cap-id="${s.id}" data-cap-field="saberes"
              value="${g.saberes !== null && g.saberes !== undefined ? g.saberes : ''}"
              placeholder="-"
              class="cream-input w-20 text-center rounded-lg py-1.5 px-2 text-xs"
            />
          </td>
          <td class="py-1.5 px-2 text-center">
            <input
              type="number" step="0.1" min="0" max="10"
              data-cap-id="${s.id}" data-cap-field="etica"
              value="${g.etica !== null && g.etica !== undefined ? g.etica : ''}"
              placeholder="-"
              class="cream-input w-20 text-center rounded-lg py-1.5 px-2 text-xs"
            />
          </td>
          <td class="py-1.5 px-2 text-center">
            <input
              type="number" step="0.1" min="0" max="10"
              data-cap-id="${s.id}" data-cap-field="humano"
              value="${g.humano !== null && g.humano !== undefined ? g.humano : ''}"
              placeholder="-"
              class="cream-input w-20 text-center rounded-lg py-1.5 px-2 text-xs"
            />
          </td>
          <td id="cap-sum-${s.id}" class="py-2 px-3 text-center font-bold text-stone-900 bg-stone-100/80">${f.suma.toFixed(1)}</td>
          <td id="cap-prom-${s.id}" class="py-2 px-3 text-center font-extrabold ${f.prom >= 6 ? 'text-emerald-800' : (f.hasAny ? 'text-rose-700' : 'text-stone-500')} bg-emerald-50/60">${f.prom.toFixed(2)}</td>
          <td id="cap-status-${s.id}" class="py-2 px-3 text-center">${statusChip}</td>
        </tr>
      `;
    }).join('');

    updateCapturaSummaryStrip();
  }

  function updateCapturaSummaryStrip() {
    const stats = computeGroupStats();
    document.getElementById('capAvgLenguajes').textContent = stats.avgLenguajes.toFixed(2);
    document.getElementById('capAvgSaberes').textContent = stats.avgSaberes.toFixed(2);
    document.getElementById('capAvgEtica').textContent = stats.avgEtica.toFixed(2);
    document.getElementById('capAvgHumano').textContent = stats.avgHumano.toFixed(2);
    document.getElementById('capTotalSumGroup').textContent = stats.totalSumaAll.toFixed(1);
    document.getElementById('capTotalAvgGroup').textContent = (stats.totalStudents ? (stats.totalSumaAll / stats.totalStudents / 4) : 0).toFixed(2);
  }

  // ===================================================================
  // SECTION 4 RENDERER: CONTROL DE EVALUACIÓN Y PONDERACIONES (100%)
  // ===================================================================
  function renderWeightedTable() {
    const filterMode = document.getElementById('evalWeightedFilter').value;
    const query = state.searchQuery.trim().toLowerCase();
    const period = state.currentPeriod;

    const filtered = state.students.filter(s => {
      if (query && !s.name.toLowerCase().includes(query) && String(s.no) !== query) return false;
      const w = calcWeightedRow(s.weighted[period]);
      if (filterMode === 'CAPTURED') return w.hasAny;
      if (filterMode === 'PENDING') return !w.hasAny;
      if (filterMode === 'APROBADO') return w.hasAny && w.estatus === 'APROBADO';
      if (filterMode === 'REPROBADO') return w.hasAny && w.estatus === 'REPROBADO';
      return true;
    });

    const tbody = document.getElementById('weightedTableBody');
    tbody.innerHTML = filtered.map(s => {
      const w = s.weighted[period] || { examen: null, tareas: null, trabajos: null, muestreos: null, proyectos: null, participacion: null, disciplina: null };
      const c = calcWeightedRow(w);

      return `
        <tr class="hover:bg-amber-50/40 transition" data-weighted-row="${s.id}">
          <td class="py-1.5 px-2 text-center font-bold text-stone-700">${s.no}</td>
          <td class="py-1.5 px-2 font-semibold text-stone-900 whitespace-nowrap">
            <button type="button" data-open-student="${s.id}" class="hover:underline text-left">${s.name}</button>
          </td>

          <!-- Examen (Max 20 -> 30%) -->
          <td class="py-1 px-1.5 text-center">
            <input type="number" step="1" min="0" max="20" data-w-id="${s.id}" data-w-field="examen" data-w-max="20"
              value="${w.examen !== null && w.examen !== undefined ? w.examen : ''}" placeholder="-"
              class="cream-input w-14 text-center rounded py-1 px-1 text-[11px]" />
          </td>
          <td id="w-pct-examen-${s.id}" class="py-1 px-1.5 text-center font-semibold text-stone-700 bg-stone-100/70">
            ${c.hasAny ? (c.pctExamen * 100).toFixed(1) + '%' : ''}
          </td>

          <!-- Tareas (Max 25 -> 20%) -->
          <td class="py-1 px-1.5 text-center">
            <input type="number" step="1" min="0" max="25" data-w-id="${s.id}" data-w-field="tareas" data-w-max="25"
              value="${w.tareas !== null && w.tareas !== undefined ? w.tareas : ''}" placeholder="-"
              class="cream-input w-14 text-center rounded py-1 px-1 text-[11px]" />
          </td>
          <td id="w-pct-tareas-${s.id}" class="py-1 px-1.5 text-center font-semibold text-stone-700 bg-stone-100/70">
            ${c.hasAny ? (c.pctTareas * 100).toFixed(1) + '%' : ''}
          </td>

          <!-- Trabajos Concluidos (Max 30 -> 20%) -->
          <td class="py-1 px-1.5 text-center">
            <input type="number" step="1" min="0" max="30" data-w-id="${s.id}" data-w-field="trabajos" data-w-max="30"
              value="${w.trabajos !== null && w.trabajos !== undefined ? w.trabajos : ''}" placeholder="-"
              class="cream-input w-14 text-center rounded py-1 px-1 text-[11px]" />
          </td>
          <td id="w-pct-trabajos-${s.id}" class="py-1 px-1.5 text-center font-semibold text-stone-700 bg-stone-100/70">
            ${c.hasAny ? (c.pctTrabajos * 100).toFixed(1) + '%' : ''}
          </td>

          <!-- Muestreos (Max 3) + Proyectos (Max 6) -> 10% -->
          <td class="py-1 px-1.5 text-center">
            <input type="number" step="1" min="0" max="3" data-w-id="${s.id}" data-w-field="muestreos" data-w-max="3"
              value="${w.muestreos !== null && w.muestreos !== undefined ? w.muestreos : ''}" placeholder="-"
              class="cream-input w-12 text-center rounded py-1 px-1 text-[11px]" />
          </td>
          <td class="py-1 px-1.5 text-center">
            <input type="number" step="1" min="0" max="6" data-w-id="${s.id}" data-w-field="proyectos" data-w-max="6"
              value="${w.proyectos !== null && w.proyectos !== undefined ? w.proyectos : ''}" placeholder="-"
              class="cream-input w-12 text-center rounded py-1 px-1 text-[11px]" />
          </td>
          <td id="w-pct-muestproy-${s.id}" class="py-1 px-1.5 text-center font-semibold text-stone-700 bg-stone-100/70">
            ${c.hasAny ? (c.pctMuestProy * 100).toFixed(1) + '%' : ''}
          </td>

          <!-- Participación (Max 10 -> 10%) -->
          <td class="py-1 px-1.5 text-center">
            <input type="number" step="1" min="0" max="10" data-w-id="${s.id}" data-w-field="participacion" data-w-max="10"
              value="${w.participacion !== null && w.participacion !== undefined ? w.participacion : ''}" placeholder="-"
              class="cream-input w-12 text-center rounded py-1 px-1 text-[11px]" />
          </td>
          <td id="w-pct-part-${s.id}" class="py-1 px-1.5 text-center font-semibold text-stone-700 bg-stone-100/70">
            ${c.hasAny ? (c.pctParticipacion * 100).toFixed(1) + '%' : ''}
          </td>

          <!-- Disciplina (Max 10 -> 10%) -->
          <td class="py-1 px-1.5 text-center">
            <input type="number" step="1" min="0" max="10" data-w-id="${s.id}" data-w-field="disciplina" data-w-max="10"
              value="${w.disciplina !== null && w.disciplina !== undefined ? w.disciplina : ''}" placeholder="-"
              class="cream-input w-12 text-center rounded py-1 px-1 text-[11px]" />
          </td>
          <td id="w-pct-disc-${s.id}" class="py-1 px-1.5 text-center font-semibold text-stone-700 bg-stone-100/70">
            ${c.hasAny ? (c.pctDisciplina * 100).toFixed(1) + '%' : ''}
          </td>

          <!-- Total % (100%), Calificación (0-10), Estatus -->
          <td id="w-totpct-${s.id}" class="py-1 px-2 text-center font-bold text-stone-900 bg-stone-200/70">
            ${c.hasAny ? (c.totalPct * 100).toFixed(2) + '%' : ''}
          </td>
          <td id="w-calif-${s.id}" class="py-1 px-2 text-center font-extrabold text-xs ${c.hasAny ? (c.calificacion >= 6 ? 'text-emerald-800 bg-emerald-50' : 'text-rose-700 bg-rose-50') : ''}">
            ${c.hasAny ? c.calificacion.toFixed(2) : ''}
          </td>
          <td id="w-status-${s.id}" class="py-1 px-2 text-center">
            ${c.hasAny
              ? (c.estatus === 'APROBADO'
                  ? '<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">APROBADO</span>'
                  : '<span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">REPROBADO</span>')
              : '<span class="text-stone-400 text-[10px]">Pendiente</span>'}
          </td>
        </tr>
      `;
    }).join('');

    updateWeightedFooterRow();
  }

  // Exact Row 40 ("PROMEDIO DEL GRUPO") from Hoja2 of the Excel
  function updateWeightedFooterRow() {
    const period = state.currentPeriod;
    const activeRows = [];
    state.students.forEach(s => {
      const w = s.weighted[period];
      const c = calcWeightedRow(w);
      if (c.hasAny) {
        activeRows.push({ w, c });
      }
    });

    const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
    const fmtNum = (val, dec = 1) => val !== null ? val.toFixed(dec) : '-';
    const fmtPct = (val) => val !== null ? (val * 100).toFixed(1) + '%' : '-';

    const avgExam = avg(activeRows.map(x => Number(x.w.examen || 0)));
    const avgPctExam = avg(activeRows.map(x => x.c.pctExamen));
    const avgTareas = avg(activeRows.map(x => Number(x.w.tareas || 0)));
    const avgPctTareas = avg(activeRows.map(x => x.c.pctTareas));
    const avgTrab = avg(activeRows.map(x => Number(x.w.trabajos || 0)));
    const avgPctTrab = avg(activeRows.map(x => x.c.pctTrabajos));
    const avgMuest = avg(activeRows.map(x => Number(x.w.muestreos || 0)));
    const avgProy = avg(activeRows.map(x => Number(x.w.proyectos || 0)));
    const avgPctMP = avg(activeRows.map(x => x.c.pctMuestProy));
    const avgPart = avg(activeRows.map(x => Number(x.w.participacion || 0)));
    const avgPctPart = avg(activeRows.map(x => x.c.pctParticipacion));
    const avgDisc = avg(activeRows.map(x => Number(x.w.disciplina || 0)));
    const avgPctDisc = avg(activeRows.map(x => x.c.pctDisciplina));
    const avgTotPct = avg(activeRows.map(x => x.c.totalPct));
    const avgCalif = avg(activeRows.map(x => x.c.calificacion));
    const approvedCnt = activeRows.filter(x => x.c.estatus === 'APROBADO').length;

    const tfoot = document.getElementById('weightedTableFoot');
    if (!tfoot) return;
    tfoot.innerHTML = `
      <tr>
        <td colspan="2" class="py-2.5 px-3 text-left font-extrabold text-amber-300">PROMEDIO DEL GRUPO (${activeRows.length} capturados)</td>
        <td class="py-2.5 px-1.5 text-center">${fmtNum(avgExam)}</td>
        <td class="py-2.5 px-1.5 text-center text-amber-200">${fmtPct(avgPctExam)}</td>
        <td class="py-2.5 px-1.5 text-center">${fmtNum(avgTareas)}</td>
        <td class="py-2.5 px-1.5 text-center text-amber-200">${fmtPct(avgPctTareas)}</td>
        <td class="py-2.5 px-1.5 text-center">${fmtNum(avgTrab)}</td>
        <td class="py-2.5 px-1.5 text-center text-amber-200">${fmtPct(avgPctTrab)}</td>
        <td class="py-2.5 px-1.5 text-center">${fmtNum(avgMuest)}</td>
        <td class="py-2.5 px-1.5 text-center">${fmtNum(avgProy)}</td>
        <td class="py-2.5 px-1.5 text-center text-amber-200">${fmtPct(avgPctMP)}</td>
        <td class="py-2.5 px-1.5 text-center">${fmtNum(avgPart)}</td>
        <td class="py-2.5 px-1.5 text-center text-amber-200">${fmtPct(avgPctPart)}</td>
        <td class="py-2.5 px-1.5 text-center">${fmtNum(avgDisc)}</td>
        <td class="py-2.5 px-1.5 text-center text-amber-200">${fmtPct(avgPctDisc)}</td>
        <td class="py-2.5 px-2 text-center text-emerald-300">${avgTotPct !== null ? (avgTotPct * 100).toFixed(2) + '%' : '-'}</td>
        <td class="py-2.5 px-2 text-center text-sm font-extrabold text-amber-300">${fmtNum(avgCalif, 2)}</td>
        <td class="py-2.5 px-2 text-center text-emerald-300">${approvedCnt} Aprobados</td>
      </tr>
    `;
  }

  // ===================================================================
  // SECTION 5 RENDERER: REPORTES LIVE PREVIEW
  // ===================================================================
  function renderReportsSection() {
    const selectStu = document.getElementById('pdfStudentSelect');
    if (selectStu) {
      const currentVal = selectStu.value;
      selectStu.innerHTML = state.students.map(s => `<option value="${s.id}">${s.no}. ${s.name}</option>`).join('');
      if (currentVal && state.students.some(s => s.id === currentVal)) {
        selectStu.value = currentVal;
      }
    }

    const reportType = document.getElementById('pdfReportTypeSelect').value;
    const indWrapper = document.getElementById('pdfIndividualStudentWrapper');
    if (reportType === 'INDIVIDUAL') {
      indWrapper.classList.remove('hidden');
    } else {
      indWrapper.classList.add('hidden');
    }

    renderReportLivePreview();
  }

  function renderReportLivePreview() {
    const container = document.getElementById('reportLivePreviewContainer');
    if (!container) return;

    const cfg = state.schoolConfig;
    const period = document.getElementById('pdfPeriodSelect').value || state.currentPeriod;
    const reportType = document.getElementById('pdfReportTypeSelect').value;

    if (reportType === 'INDIVIDUAL') {
      const stuId = document.getElementById('pdfStudentSelect').value || state.students[0]?.id;
      const s = state.students.find(x => x.id === stuId) || state.students[0];
      if (!s) return;
      const g = s.grades[period] || {};
      const f = calcFormativeRow(g);
      const w = s.weighted[period] || {};
      const wc = calcWeightedRow(w);

      container.innerHTML = `
        <div class="max-w-3xl mx-auto border border-stone-300 rounded-xl p-5 bg-stone-50/50">
          <div class="text-center border-b border-stone-300 pb-3">
            <p class="font-extrabold text-sm text-stone-900">${cfg.schoolType} "${cfg.schoolName}"</p>
            <p class="text-[11px] text-stone-600">C.C.T. ${cfg.cct} · ZONA ${cfg.zone} · REGIÓN ${cfg.region} · TEL: ${cfg.phone}</p>
            <p class="text-[11px] text-stone-600">${cfg.address}</p>
            <p class="font-bold text-xs text-stone-800 mt-1">BOLETA INDIVIDUAL DE EVALUACIÓN · CICLO ESCOLAR ${cfg.cycle} (${period})</p>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 bg-white p-3 rounded-lg border border-stone-200">
            <div><span class="text-[10px] text-stone-500 block">No. Lista</span><strong>#${s.no}</strong></div>
            <div class="sm:col-span-2"><span class="text-[10px] text-stone-500 block">Alumno(a)</span><strong>${s.name}</strong></div>
            <div><span class="text-[10px] text-stone-500 block">Grado y Grupo</span><strong>${s.group} · Profra. ${cfg.teacher}</strong></div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 class="font-bold text-xs uppercase text-stone-700 mb-1.5">1. Calificaciones por Campo Formativo</h4>
              <table class="w-full border border-stone-300 text-xs">
                <tr class="border-b"><td class="p-1.5">Lenguajes</td><td class="p-1.5 text-right font-bold">${g.lenguajes ?? '-'}</td></tr>
                <tr class="border-b"><td class="p-1.5">Saberes y Pensamiento Científico</td><td class="p-1.5 text-right font-bold">${g.saberes ?? '-'}</td></tr>
                <tr class="border-b"><td class="p-1.5">Ética, Naturaleza y Sociedad</td><td class="p-1.5 text-right font-bold">${g.etica ?? '-'}</td></tr>
                <tr class="border-b"><td class="p-1.5">De lo Humano y lo Comunitario</td><td class="p-1.5 text-right font-bold">${g.humano ?? '-'}</td></tr>
                <tr class="bg-stone-100 font-bold"><td class="p-1.5">Suma / Promedio Campos</td><td class="p-1.5 text-right">${f.suma.toFixed(1)} / ${f.prom.toFixed(2)}</td></tr>
              </table>
            </div>
            <div>
              <h4 class="font-bold text-xs uppercase text-stone-700 mb-1.5">2. Desglose de Criterios Ponderados (100%)</h4>
              <table class="w-full border border-stone-300 text-xs">
                <tr class="border-b"><td class="p-1.5">Examen (Máx 20 · 30%)</td><td class="p-1.5 text-right">${w.examen ?? '-'} aciertos (${wc.hasAny ? (wc.pctExamen * 100).toFixed(1) + '%' : '-'})</td></tr>
                <tr class="border-b"><td class="p-1.5">Tareas (Máx 25 · 20%)</td><td class="p-1.5 text-right">${w.tareas ?? '-'} (${wc.hasAny ? (wc.pctTareas * 100).toFixed(1) + '%' : '-'})</td></tr>
                <tr class="border-b"><td class="p-1.5">Trabajos Concluidos (Máx 30 · 20%)</td><td class="p-1.5 text-right">${w.trabajos ?? '-'} (${wc.hasAny ? (wc.pctTrabajos * 100).toFixed(1) + '%' : '-'})</td></tr>
                <tr class="border-b"><td class="p-1.5">Muestreos (3) y Proyectos (6) (10%)</td><td class="p-1.5 text-right">${(w.muestreos ?? 0) + (w.proyectos ?? 0)}/9 (${wc.hasAny ? (wc.pctMuestProy * 100).toFixed(1) + '%' : '-'})</td></tr>
                <tr class="border-b"><td class="p-1.5">Participación (10%) y Disciplina (10%)</td><td class="p-1.5 text-right">${w.participacion ?? '-'}/10 · ${w.disciplina ?? '-'}/10</td></tr>
                <tr class="bg-emerald-50 font-extrabold"><td class="p-1.5">Calificación Final Ponderada</td><td class="p-1.5 text-right">${wc.hasAny ? wc.calificacion.toFixed(2) + ' (' + wc.estatus + ')' : 'Pendiente'}</td></tr>
              </table>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // Group preview
    const rowsHtml = state.students.slice(0, 10).map(s => {
      const g = s.grades[period] || {};
      const f = calcFormativeRow(g);
      const wc = calcWeightedRow(s.weighted[period]);
      return `
        <tr class="border-b border-stone-200">
          <td class="p-1.5 text-center font-bold">${s.no}</td>
          <td class="p-1.5 font-medium">${s.name}</td>
          <td class="p-1.5 text-center">${g.lenguajes ?? '-'}</td>
          <td class="p-1.5 text-center">${g.saberes ?? '-'}</td>
          <td class="p-1.5 text-center">${g.etica ?? '-'}</td>
          <td class="p-1.5 text-center">${g.humano ?? '-'}</td>
          <td class="p-1.5 text-center font-bold">${f.suma.toFixed(1)}</td>
          <td class="p-1.5 text-center font-bold">${f.prom.toFixed(2)}</td>
          <td class="p-1.5 text-center font-bold text-emerald-800">${wc.hasAny ? wc.calificacion.toFixed(2) : '-'}</td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div>
        <div class="text-center pb-3 mb-3 border-b border-stone-300">
          <p class="font-extrabold text-sm">${cfg.schoolType} · ${cfg.schoolName}</p>
          <p class="text-[11px] text-stone-600">C.C.T. ${cfg.cct} · ZONA ${cfg.zone} · REGIÓN ${cfg.region} · TEL: ${cfg.phone}</p>
          <p class="text-xs font-bold mt-1">CONCENTRADO GRUPAL DE CALIFICACIONES (${cfg.group}) · MAESTRA: ${cfg.teacher} · CICLO ${cfg.cycle}</p>
        </div>
        <table class="w-full text-left border-collapse text-[11px]">
          <thead>
            <tr class="bg-stone-900 text-white">
              <th class="p-1.5 text-center">No.</th>
              <th class="p-1.5">Nombre del Alumno</th>
              <th class="p-1.5 text-center">Lenguajes</th>
              <th class="p-1.5 text-center">Saberes y P.C.</th>
              <th class="p-1.5 text-center">Ética, Nat.</th>
              <th class="p-1.5 text-center">Humano y Com.</th>
              <th class="p-1.5 text-center">SUMA</th>
              <th class="p-1.5 text-center">PROM</th>
              <th class="p-1.5 text-center">Control 100%</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <p class="text-[11px] text-stone-500 mt-2 text-center">Mostrando primeros 10 de ${state.students.length} alumnos en la vista rápida. El documento descargado incluye los ${state.students.length} registros completos.</p>
      </div>
    `;
  }

  // ===================================================================
  // CONVERSION TABLES MODAL RENDERER (HOJA 3 OF EXCEL)
  // ===================================================================
  function renderConversionTablesModal() {
    const container = document.getElementById('conversionTablesContainer');
    if (!container) return;

    const buildRubricTable = (title, maxVal, weightPct, unitLabel) => {
      const rows = [];
      for (let v = maxVal; v >= 0; v--) {
        const calif = ((v / maxVal) * 10).toFixed(2);
        const pct = ((v / maxVal) * weightPct).toFixed(1) + '%';
        rows.push(`
          <tr class="border-b border-stone-200 hover:bg-amber-50">
            <td class="py-1 px-2 text-center font-bold">${v}</td>
            <td class="py-1 px-2 text-center">${calif}</td>
            <td class="py-1 px-2 text-center font-semibold text-emerald-800">${pct}</td>
          </tr>
        `);
      }
      return `
        <div class="bg-white rounded-2xl border border-stone-300 overflow-hidden shadow-sm">
          <div class="bg-stone-900 text-amber-200 px-3 py-2 font-bold text-center text-[11px]">${title}</div>
          <div class="max-h-96 overflow-y-auto">
            <table class="w-full border-collapse text-[11px]">
              <thead class="bg-stone-100 text-stone-700 sticky top-0">
                <tr>
                  <th class="py-1.5 px-2 text-center">${unitLabel}</th>
                  <th class="py-1.5 px-2 text-center">Calif. (0-10)</th>
                  <th class="py-1.5 px-2 text-center">% (${weightPct}%)</th>
                </tr>
              </thead>
              <tbody>${rows.join('')}</tbody>
            </table>
          </div>
        </div>
      `;
    };

    container.innerHTML = [
      buildRubricTable('EXAMEN (30% · 20 Aciertos)', 20, 30, 'Aciertos'),
      buildRubricTable('TAREAS (20% · 25 Tareas)', 25, 20, 'Tareas'),
      buildRubricTable('TRABAJOS (20% · 30 Trab.)', 30, 20, 'Trabajos'),
      buildRubricTable('MUEST. (3) + PROY. (6) (10%)', 9, 10, 'Entregas'),
      buildRubricTable('PARTICIP. / DISCIPLINA (10%)', 10, 10, 'Puntos')
    ].join('');
  }

  // ===================================================================
  // INDIVIDUAL STUDENT MODAL RENDERER
  // ===================================================================
  function openStudentDetailModal(studentId) {
    const s = state.students.find(x => x.id === studentId);
    if (!s) return;
    activeStudentModalId = s.id;

    const period = state.currentPeriod;
    const g = s.grades[period] || {};
    const f = calcFormativeRow(g);
    const w = s.weighted[period] || {};
    const wc = calcWeightedRow(w);

    document.getElementById('modalStudentNoBadge').textContent = `Lista #${s.no} · ${s.gender === 'M' ? 'Mujer' : 'Hombre'}`;
    document.getElementById('modalStudentName').textContent = s.name;
    document.getElementById('modalStudentMeta').textContent = `Grado y Grupo: ${s.group} · Ciclo Escolar ${state.schoolConfig.cycle} · Periodo: ${period}`;

    const body = document.getElementById('modalStudentBodyContent');
    body.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div class="bg-white rounded-2xl p-4 border border-stone-200">
          <h4 class="font-bold text-stone-900 uppercase text-[11px] mb-2">Campos Formativos (Hoja EXAMENES)</h4>
          <div class="space-y-1.5">
            <div class="flex justify-between"><span>Lenguajes:</span><strong>${g.lenguajes ?? 'Sin capturar'}</strong></div>
            <div class="flex justify-between"><span>Saberes y Pensamiento Científico:</span><strong>${g.saberes ?? 'Sin capturar'}</strong></div>
            <div class="flex justify-between"><span>Ética, Naturaleza y Sociedad:</span><strong>${g.etica ?? 'Sin capturar'}</strong></div>
            <div class="flex justify-between"><span>De lo Humano y lo Comunitario:</span><strong>${g.humano ?? 'Sin capturar'}</strong></div>
            <div class="pt-2 border-t flex justify-between font-bold text-stone-900">
              <span>Suma Total / Promedio:</span>
              <span>${f.suma.toFixed(1)} pts · Prom: ${f.prom.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-4 border border-stone-200">
          <h4 class="font-bold text-stone-900 uppercase text-[11px] mb-2">Control de Evaluación Ponderada (100%)</h4>
          <div class="space-y-1.5">
            <div class="flex justify-between"><span>Examen (Máx 20 · 30%):</span><strong>${w.examen ?? '-'} aciertos (${wc.hasAny ? (wc.pctExamen * 100).toFixed(1) + '%' : '-'})</strong></div>
            <div class="flex justify-between"><span>Tareas (Máx 25 · 20%):</span><strong>${w.tareas ?? '-'} (${wc.hasAny ? (wc.pctTareas * 100).toFixed(1) + '%' : '-'})</strong></div>
            <div class="flex justify-between"><span>Trabajos Concluidos (Máx 30 · 20%):</span><strong>${w.trabajos ?? '-'} (${wc.hasAny ? (wc.pctTrabajos * 100).toFixed(1) + '%' : '-'})</strong></div>
            <div class="flex justify-between"><span>Muestreos (3) y Proyectos (6) (10%):</span><strong>M:${w.muestreos ?? '-'} P:${w.proyectos ?? '-'} (${wc.hasAny ? (wc.pctMuestProy * 100).toFixed(1) + '%' : '-'})</strong></div>
            <div class="flex justify-between"><span>Participación (10%) y Disciplina (10%):</span><strong>${w.participacion ?? '-'}/10 · ${w.disciplina ?? '-'}/10</strong></div>
            <div class="pt-2 border-t flex justify-between font-extrabold ${wc.hasAny && wc.calificacion >= 6 ? 'text-emerald-800' : 'text-rose-700'}">
              <span>Calificación Final (0-10):</span>
              <span>${wc.hasAny ? wc.calificacion.toFixed(2) + ' (' + wc.estatus + ')' : 'Pendiente de captura'}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('studentDetailModal').classList.remove('hidden');
  }

  // ===================================================================
  // EXCEL (.XLSX) GENERATOR (Exact structure & formulas of 6° A 2026Gm.xlsx)
  // ===================================================================
  function exportFullExcelWorkbook() {
    if (typeof XLSX === 'undefined') {
      showToast('Librería Excel no disponible en este momento.');
      return;
    }

    const cfg = state.schoolConfig;
    const period = state.currentPeriod;
    const wb = XLSX.utils.book_new();

    // Helper to build Sheet 1 ("EXAMENES") and Sheet 4 ("sistema2") matching exact rows 1..49 of original file
    const buildExamenesSheet = () => {
      const aoa = [];
      aoa.push([]); // Row 1 empty
      aoa.push([null, cfg.schoolType]); // Row 2
      aoa.push([null, cfg.schoolName]); // Row 3
      aoa.push([null, `C.C.T.  ${cfg.cct}        ZONA ${cfg.zone}    REGIÓN ${cfg.region}            TEL:${cfg.phone}`]); // Row 4
      aoa.push([null, `DIRECCIÓN: ${cfg.address}`]); // Row 5
      aoa.push([null, 'RESULTADOS DE EXAMENES']); // Row 6
      aoa.push(['                                                          ', `CICLO ESCOLAR ${cfg.cycle}                                          ${period}`]); // Row 7
      aoa.push([null, 'Nombre del Maestro:', cfg.teacher]); // Row 8
      aoa.push([]); // Row 9 empty
      aoa.push(['No.', 'NOMBRE DEL ALUMNO', 'LENGUAJES', 'SABERES Y PENSAMIENTO CIENTIFICO', 'ETICA, NATURALEZA Y SOCIEDAD', ' HUMANO Y LO COMUNITARIO', 'SUMA', 'PROM']); // Row 10

      state.students.forEach((s, idx) => {
        const rNum = 11 + idx;
        const g = s.grades[period] || {};
        const f = calcFormativeRow(g);
        aoa.push([
          s.no,
          s.name,
          g.lenguajes !== null && g.lenguajes !== undefined ? Number(g.lenguajes) : null,
          g.saberes !== null && g.saberes !== undefined ? Number(g.saberes) : null,
          g.etica !== null && g.etica !== undefined ? Number(g.etica) : null,
          g.humano !== null && g.humano !== undefined ? Number(g.humano) : null,
          { t: 'n', v: f.suma, f: `SUM(C${rNum}:F${rNum})` },
          { t: 'n', v: f.prom, f: `AVERAGE(G${rNum}/4)` }
        ]);
      });

      const lastStudentRow = 10 + state.students.length;
      aoa.push([]); // Row 46
      aoa.push([]); // Row 47
      const stats = computeGroupStats();
      const sumRowIdx = lastStudentRow + 3;
      aoa.push([
        null,
        'HOMBRES                     MUJERES               TOTAL',
        null, null, null, null,
        { t: 'n', v: stats.totalSumaAll, f: `SUM(G11:G${lastStudentRow})` },
        { t: 'n', v: stats.totalStudents ? stats.totalSumaAll / stats.totalStudents : 0, f: `AVERAGE(G${sumRowIdx}/${state.students.length})` }
      ]);
      aoa.push([
        null,
        `         ${stats.menCount}                                  ${stats.womenCount}                           ${stats.totalStudents}`
      ]);

      const ws = XLSX.utils.aoa_to_sheet(aoa);
      ws['!cols'] = [
        { wch: 6 }, { wch: 40 }, { wch: 14 }, { wch: 32 },
        { wch: 30 }, { wch: 28 }, { wch: 12 }, { wch: 12 }
      ];
      return ws;
    };

    // Build Sheet 2 ("Hoja2" - CONTROL DE EVALUACIÓN Y PONDERACIONES 100%)
    const buildHoja2Sheet = () => {
      const aoa = [];
      aoa.push(['CONTROL DE EVALUACIÓN Y PONDERACIONES (100%)']);
      aoa.push(['Instrucciones: Capture únicamente las celdas en color crema (Aciertos / Entregas / Puntos). Los porcentajes y la calificación final se calculan automáticamente.']);
      aoa.push(['DATOS DEL ALUMNO', null, 'EXAMEN (30%)', null, 'TAREAS (20%)', null, 'TRABAJOS CONCLUIDOS (20%)', null, 'MUESTREOS Y PROYECTOS (10%)', null, null, 'PARTICIPACIÓN (10%)', null, 'DISCIPLINA (10%)', null, 'RESULTADO FINAL']);
      aoa.push([
        'No.', 'Nombre del Alumno',
        'Aciertos\n(Máx 20)', '% Examen\n(30%)',
        'Tareas\n(Máx 25)', '% Tareas\n(20%)',
        'Trabajos\n(Máx 30)', '% Trabajos\n(20%)',
        'Muestreos\n(Máx 3)', 'Proyectos\n(Máx 6)', '% Muest. y Proy.\n(10%)',
        'Puntos\n(Máx 10)', '% Particip.\n(10%)',
        'Puntos\n(Máx 10)', '% Disciplina\n(10%)',
        'Total %\n(100%)', 'Calificación\n(0 - 10)', 'Estatus'
      ]);

      state.students.forEach((s, idx) => {
        const r = 5 + idx;
        const w = s.weighted[period] || {};
        const c = calcWeightedRow(w);
        const countCheck = `COUNTA(C${r},E${r},G${r},I${r},J${r},L${r},N${r})=0`;

        aoa.push([
          s.no,
          s.name,
          w.examen !== null && w.examen !== undefined ? Number(w.examen) : null,
          c.hasAny ? { t: 'n', v: c.pctExamen, f: `IF(${countCheck}, "", (C${r}/20)*0.3)` } : { t: 's', v: '', f: `IF(${countCheck}, "", (C${r}/20)*0.3)` },
          w.tareas !== null && w.tareas !== undefined ? Number(w.tareas) : null,
          c.hasAny ? { t: 'n', v: c.pctTareas, f: `IF(${countCheck}, "", (E${r}/25)*0.2)` } : { t: 's', v: '', f: `IF(${countCheck}, "", (E${r}/25)*0.2)` },
          w.trabajos !== null && w.trabajos !== undefined ? Number(w.trabajos) : null,
          c.hasAny ? { t: 'n', v: c.pctTrabajos, f: `IF(${countCheck}, "", (G${r}/30)*0.2)` } : { t: 's', v: '', f: `IF(${countCheck}, "", (G${r}/30)*0.2)` },
          w.muestreos !== null && w.muestreos !== undefined ? Number(w.muestreos) : null,
          w.proyectos !== null && w.proyectos !== undefined ? Number(w.proyectos) : null,
          c.hasAny ? { t: 'n', v: c.pctMuestProy, f: `IF(${countCheck}, "", ((I${r}+J${r})/9)*0.1)` } : { t: 's', v: '', f: `IF(${countCheck}, "", ((I${r}+J${r})/9)*0.1)` },
          w.participacion !== null && w.participacion !== undefined ? Number(w.participacion) : null,
          c.hasAny ? { t: 'n', v: c.pctParticipacion, f: `IF(${countCheck}, "", (L${r}/10)*0.1)` } : { t: 's', v: '', f: `IF(${countCheck}, "", (L${r}/10)*0.1)` },
          w.disciplina !== null && w.disciplina !== undefined ? Number(w.disciplina) : null,
          c.hasAny ? { t: 'n', v: c.pctDisciplina, f: `IF(${countCheck}, "", (N${r}/10)*0.1)` } : { t: 's', v: '', f: `IF(${countCheck}, "", (N${r}/10)*0.1)` },
          c.hasAny ? { t: 'n', v: c.totalPct, f: `IF(${countCheck}, "", SUM(D${r},F${r},H${r},K${r},M${r},O${r}))` } : { t: 's', v: '', f: `IF(${countCheck}, "", SUM(D${r},F${r},H${r},K${r},M${r},O${r}))` },
          c.hasAny ? { t: 'n', v: c.calificacion, f: `IF(P${r}="", "", P${r}*10)` } : { t: 's', v: '', f: `IF(P${r}="", "", P${r}*10)` },
          c.hasAny ? { t: 's', v: c.estatus, f: `IF(Q${r}="", "", IF(Q${r}>=6, "APROBADO", "REPROBADO"))` } : { t: 's', v: '', f: `IF(Q${r}="", "", IF(Q${r}>=6, "APROBADO", "REPROBADO"))` }
        ]);
      });

      const lastR = 4 + state.students.length;
      const cols = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'];
      const avgRow = ['PROMEDIO DEL GRUPO', null];
      cols.forEach(col => {
        avgRow.push({ t: 'n', f: `IFERROR(AVERAGE(${col}5:${col}${lastR}), "")` });
      });
      avgRow.push({ t: 's', f: `IFERROR(COUNTIF(R5:R${lastR}, "APROBADO") & " Aprobados", "")` });
      aoa.push(avgRow);

      const ws = XLSX.utils.aoa_to_sheet(aoa);
      ws['!cols'] = [
        { wch: 5 }, { wch: 38 }, { wch: 11 }, { wch: 11 }, { wch: 11 }, { wch: 11 },
        { wch: 11 }, { wch: 11 }, { wch: 11 }, { wch: 11 }, { wch: 13 }, { wch: 11 },
        { wch: 11 }, { wch: 11 }, { wch: 11 }, { wch: 12 }, { wch: 13 }, { wch: 14 }
      ];
      return ws;
    };

    // Build Sheet 3 ("Hoja3" - TABLAS DE CONVERSIÓN RÁPIDA POR RUBRO DE EVALUACIÓN)
    const buildHoja3Sheet = () => {
      const aoa = [];
      aoa.push(['TABLAS DE CONVERSIÓN RÁPIDA POR RUBRO DE EVALUACIÓN']);
      aoa.push([]);
      aoa.push([
        'EXAMEN (30% - 20 Aciertos)', null, null, null,
        'TAREAS (20% - 25 Tareas)', null, null, null,
        'TRABAJOS CONCLUIDOS (20% - 30 Trab.)', null, null, null,
        'MUESTREOS (3) + PROYECTOS (6) (10%)', null, null, null,
        'PARTICIPACIÓN / DISCIPLINA (10% c/u)'
      ]);
      aoa.push([
        'Aciertos', 'Calif. (0-10)', 'Porcentaje (30%)', null,
        'Tareas', 'Calif. (0-10)', 'Porcentaje (20%)', null,
        'Trabajos', 'Calif. (0-10)', 'Porcentaje (20%)', null,
        'Entregas (de 9)', 'Calif. (0-10)', 'Porcentaje (10%)', null,
        'Puntos (0-10)', 'Calif. (0-10)', 'Porcentaje (10%)'
      ]);

      for (let i = 0; i <= 30; i++) {
        const vExam = 20 - i >= 0 ? 20 - i : null;
        const vTar = 25 - i >= 0 ? 25 - i : null;
        const vTrab = 30 - i >= 0 ? 30 - i : null;
        const vMP = 9 - i >= 0 ? 9 - i : null;
        const vPD = 10 - i >= 0 ? 10 - i : null;

        aoa.push([
          vExam, vExam !== null ? (vExam / 20) * 10 : null, vExam !== null ? (vExam / 20) * 0.3 : null, null,
          vTar, vTar !== null ? (vTar / 25) * 10 : null, vTar !== null ? (vTar / 25) * 0.2 : null, null,
          vTrab, vTrab !== null ? (vTrab / 30) * 10 : null, vTrab !== null ? (vTrab / 30) * 0.2 : null, null,
          vMP, vMP !== null ? (vMP / 9) * 10 : null, vMP !== null ? (vMP / 9) * 0.1 : null, null,
          vPD, vPD !== null ? (vPD / 10) * 10 : null, vPD !== null ? (vPD / 10) * 0.1 : null
        ]);
      }
      return XLSX.utils.aoa_to_sheet(aoa);
    };

    XLSX.utils.book_append_sheet(wb, buildExamenesSheet(), 'EXAMENES');
    XLSX.utils.book_append_sheet(wb, buildHoja2Sheet(), 'Hoja2');
    XLSX.utils.book_append_sheet(wb, buildHoja3Sheet(), 'Hoja3');
    XLSX.utils.book_append_sheet(wb, buildExamenesSheet(), 'sistema2');

    const filename = `6°_A_2026Gm_${period}.xlsx`;
    XLSX.writeFile(wb, filename);
    showToast(`Archivo Excel "${filename}" generado y descargado`);
  }

  // ===================================================================
  // PDF GENERATOR (Group Landscape & Individual Portrait via jsPDF)
  // ===================================================================
  function generatePdfReport(overrideType = null, overrideStudentId = null) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      showToast('Librería PDF no disponible en este momento.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const cfg = state.schoolConfig;
    const period = document.getElementById('pdfPeriodSelect')?.value || state.currentPeriod;
    const reportType = overrideType || document.getElementById('pdfReportTypeSelect')?.value || 'GROUP_BOTH';

    if (reportType === 'INDIVIDUAL') {
      const stuId = overrideStudentId || document.getElementById('pdfStudentSelect')?.value || state.students[0]?.id;
      const s = state.students.find(x => x.id === stuId) || state.students[0];
      if (!s) return;

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
      const g = s.grades[period] || {};
      const f = calcFormativeRow(g);
      const w = s.weighted[period] || {};
      const wc = calcWeightedRow(w);

      // Institutional Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(cfg.schoolType, 108, 16, { align: 'center' });
      doc.setFontSize(12);
      doc.text(cfg.schoolName, 108, 22, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`C.C.T. ${cfg.cct}   |   ZONA ${cfg.zone}   |   REGIÓN ${cfg.region}   |   TEL: ${cfg.phone}`, 108, 28, { align: 'center' });
      doc.text(`DIRECCIÓN: ${cfg.address}`, 108, 33, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`REPORTE INDIVIDUAL DE EVALUACIÓN · CICLO ESCOLAR ${cfg.cycle} (${period})`, 108, 42, { align: 'center' });

      // Student Metadata Box
      doc.autoTable({
        startY: 47,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2.5 },
        headStyles: { fillColor: [44, 37, 32], textColor: 255 },
        head: [['No. Lista', 'Nombre del Alumno(a)', 'Grado y Grupo', 'Docente Titular']],
        body: [[String(s.no), s.name, s.group, cfg.teacher]]
      });

      // Table 1: Campos Formativos
      doc.setFontSize(10);
      doc.text('1. Calificaciones por Campo Formativo (Escala 0 a 10)', 14, doc.lastAutoTable.finalY + 9);
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 12,
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 2.5 },
        headStyles: { fillColor: [23, 138, 104], textColor: 255 },
        head: [['Campo Formativo', 'Calificación Obtenida']],
        body: [
          ['Lenguajes', g.lenguajes !== null && g.lenguajes !== undefined ? String(g.lenguajes) : 'Pendiente'],
          ['Saberes y Pensamiento Científico', g.saberes !== null && g.saberes !== undefined ? String(g.saberes) : 'Pendiente'],
          ['Ética, Naturaleza y Sociedad', g.etica !== null && g.etica !== undefined ? String(g.etica) : 'Pendiente'],
          ['De lo Humano y lo Comunitario', g.humano !== null && g.humano !== undefined ? String(g.humano) : 'Pendiente'],
          ['SUMA DE CAMPOS FORMATIVOS', f.suma.toFixed(1)],
          ['PROMEDIO DE CAMPOS FORMATIVOS', f.prom.toFixed(2)]
        ]
      });

      // Table 2: Desglose de Criterios de Evaluación Ponderada (100%)
      doc.setFontSize(10);
      doc.text('2. Desglose del Sistema de Evaluación Ponderada (100%)', 14, doc.lastAutoTable.finalY + 9);
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 12,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2.5 },
        headStyles: { fillColor: [44, 37, 32], textColor: 255 },
        head: [['Criterio de Evaluación', 'Valor Máximo', 'Ponderación', 'Valor Capturado', 'Aportación (%)']],
        body: [
          ['Examen', '20 aciertos', '30%', w.examen ?? '-', wc.hasAny ? (wc.pctExamen * 100).toFixed(2) + '%' : '-'],
          ['Tareas', '25 tareas', '20%', w.tareas ?? '-', wc.hasAny ? (wc.pctTareas * 100).toFixed(2) + '%' : '-'],
          ['Trabajos concluidos', '30 trabajos', '20%', w.trabajos ?? '-', wc.hasAny ? (wc.pctTrabajos * 100).toFixed(2) + '%' : '-'],
          ['Muestreos (3) y Proyectos (6)', '9 entregas', '10%', `M:${w.muestreos ?? '-'} / P:${w.proyectos ?? '-'}`, wc.hasAny ? (wc.pctMuestProy * 100).toFixed(2) + '%' : '-'],
          ['Participación', '10 puntos', '10%', w.participacion ?? '-', wc.hasAny ? (wc.pctParticipacion * 100).toFixed(2) + '%' : '-'],
          ['Disciplina', '10 puntos', '10%', w.disciplina ?? '-', wc.hasAny ? (wc.pctDisciplina * 100).toFixed(2) + '%' : '-'],
          ['TOTAL ACUMULADO / CALIFICACIÓN FINAL', 'Escala 0 - 10', '100%', wc.hasAny ? wc.calificacion.toFixed(2) : 'Pendiente', wc.hasAny ? (wc.totalPct * 100).toFixed(2) + '% (' + wc.estatus + ')' : '-']
        ]
      });

      // Signatures
      const sigY = doc.lastAutoTable.finalY + 28;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.line(30, sigY, 95, sigY);
      doc.text(`Profra. ${cfg.teacher}`, 62.5, sigY + 5, { align: 'center' });
      doc.text('Docente de Grupo', 62.5, sigY + 9, { align: 'center' });

      doc.line(120, sigY, 185, sigY);
      doc.text('Firma de Madre, Padre de Familia o Tutor', 152.5, sigY + 5, { align: 'center' });

      const cleanName = s.name.replace(/\s+/g, '_').slice(0, 28);
      doc.save(`Reporte_Individual_${s.no}_${cleanName}.pdf`);
      showToast(`Reporte PDF individual de ${s.name} descargado`);
      return;
    }

    // GROUP REPORT (Horizontal / Landscape orientation for group tables)
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' });
    const stats = computeGroupStats();

    const drawGroupHeader = (subtitle) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`${cfg.schoolType} · ${cfg.schoolName}`, 140, 13, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`C.C.T. ${cfg.cct}   |   ZONA ${cfg.zone}   |   REGIÓN ${cfg.region}   |   TEL: ${cfg.phone}   |   ${cfg.address}`, 140, 18, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`${subtitle}   ·   GRADO Y GRUPO: ${cfg.group}   ·   CICLO ESCOLAR: ${cfg.cycle} (${period})`, 140, 24, { align: 'center' });
      doc.setFontSize(9);
      doc.text(`DOCENTE: ${cfg.teacher}     |     ALUMNOS: ${stats.totalStudents} (Hombres: ${stats.menCount}, Mujeres: ${stats.womenCount})     |     PROMEDIO GRUPAL: ${stats.groupAvg.toFixed(2)}`, 140, 29, { align: 'center' });
    };

    if (reportType === 'GROUP_FIELDS' || reportType === 'GROUP_BOTH') {
      drawGroupHeader('CONCENTRADO GRUPAL DE CALIFICACIONES POR CAMPO FORMATIVO');
      const bodyRows = state.students.map(s => {
        const g = s.grades[period] || {};
        const f = calcFormativeRow(g);
        const wc = calcWeightedRow(s.weighted[period]);
        return [
          s.no,
          s.name,
          g.lenguajes ?? '-',
          g.saberes ?? '-',
          g.etica ?? '-',
          g.humano ?? '-',
          f.suma.toFixed(1),
          f.prom.toFixed(2),
          wc.hasAny ? wc.calificacion.toFixed(2) : '-',
          (wc.hasAny ? wc.calificacion : f.prom) >= 6 ? 'APROBADO' : 'REPROBADO'
        ];
      });

      doc.autoTable({
        startY: 33,
        theme: 'grid',
        styles: { fontSize: 7.5, cellPadding: 1.4 },
        headStyles: { fillColor: [44, 37, 32], textColor: 255, halign: 'center' },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { cellWidth: 74 },
          2: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'center' },
          5: { halign: 'center' },
          6: { halign: 'center', fontStyle: 'bold' },
          7: { halign: 'center', fontStyle: 'bold' },
          8: { halign: 'center', fontStyle: 'bold' },
          9: { halign: 'center' }
        },
        head: [['No.', 'NOMBRE DEL ALUMNO', 'LENGUAJES', 'SABERES Y P. C.', 'ÉTICA, NAT. Y SOC.', 'HUMANO Y COM.', 'SUMA', 'PROM. CAMPOS', 'CALIF. PONDERADA', 'ESTATUS']],
        body: bodyRows
      });
    }

    if (reportType === 'GROUP_WEIGHTED' || reportType === 'GROUP_BOTH') {
      if (reportType === 'GROUP_BOTH') doc.addPage('letter', 'landscape');
      drawGroupHeader('CONTROL DE EVALUACIÓN Y PONDERACIONES (100%)');

      const wBody = state.students.map(s => {
        const w = s.weighted[period] || {};
        const c = calcWeightedRow(w);
        return [
          s.no,
          s.name,
          w.examen ?? '-',
          c.hasAny ? (c.pctExamen * 100).toFixed(1) + '%' : '-',
          w.tareas ?? '-',
          c.hasAny ? (c.pctTareas * 100).toFixed(1) + '%' : '-',
          w.trabajos ?? '-',
          c.hasAny ? (c.pctTrabajos * 100).toFixed(1) + '%' : '-',
          w.muestreos ?? '-',
          w.proyectos ?? '-',
          c.hasAny ? (c.pctMuestProy * 100).toFixed(1) + '%' : '-',
          w.participacion ?? '-',
          w.disciplina ?? '-',
          c.hasAny ? (c.totalPct * 100).toFixed(1) + '%' : '-',
          c.hasAny ? c.calificacion.toFixed(2) : '-',
          c.hasAny ? c.estatus : 'PENDIENTE'
        ];
      });

      doc.autoTable({
        startY: 33,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 1.2, halign: 'center' },
        headStyles: { fillColor: [23, 138, 104], textColor: 255 },
        columnStyles: { 1: { halign: 'left', cellWidth: 62 } },
        head: [['No.', 'Nombre del Alumno', 'Exam (20)', '% (30%)', 'Tareas (25)', '% (20%)', 'Trab. (30)', '% (20%)', 'Muest (3)', 'Proy (6)', '% (10%)', 'Part (10)', 'Disc (10)', 'Total %', 'Calif (0-10)', 'Estatus']],
        body: wBody
      });
    }

    const pdfFilename = `Reporte_Grupal_${cfg.group.replace(/\s+/g, '')}_${period}.pdf`;
    doc.save(pdfFilename);
    showToast(`Reporte PDF "${pdfFilename}" generado y descargado`);
  }

  // ===================================================================
  // NAVIGATION & VIEW CONTROLLER
  // ===================================================================
  function switchView(viewName) {
    const validViews = ['inicio', 'alumnos', 'captura', 'evaluaciones', 'reportes', 'configuracion'];
    if (!validViews.includes(viewName)) return;
    state.currentView = viewName;

    validViews.forEach(v => {
      const el = document.getElementById('view-' + v);
      if (el) {
        if (v === viewName) el.classList.remove('hidden');
        else el.classList.add('hidden');
      }
    });

    // Update Sidebar & Bottom Dock active state
    document.querySelectorAll('.nav-item-btn').forEach(btn => {
      btn.classList.toggle('nav-btn-active', btn.dataset.nav === viewName);
    });
    document.querySelectorAll('.dock-item-btn').forEach(btn => {
      btn.classList.toggle('dock-btn-active', btn.dataset.nav === viewName);
    });

    // Update Section Header Titles
    const titles = {
      inicio: ['Panel General · ' + state.schoolConfig.group, 'Monitoreo académico en tiempo real, evaluación formativa y control ponderado del grupo.'],
      alumnos: ['Gestión de Alumnos · ' + state.schoolConfig.group, 'Administración del padrón estudiantil, expedientes individuales e importación/exportación Excel.'],
      captura: ['Captura de Calificaciones · Campos Formativos', 'Edición directa rápida de Lenguajes, Saberes, Ética y De lo Humano con suma y promedio automáticos.'],
      evaluaciones: ['Control de Evaluación y Ponderaciones (100%)', 'Captura de aciertos, tareas, trabajos concluidos, muestreos/proyectos, participación y disciplina.'],
      reportes: ['Generación de Reportes Oficiales (Excel y PDF)', 'Descarga el libro .xlsx con fórmulas activas o genera reportes PDF grupales e individuales listos para impresión.'],
      configuracion: ['Configuración Institucional, Seguridad y Respaldo', 'Personaliza los datos de la escuela, credenciales de acceso docente y copias de seguridad.']
    };

    const [t, sub] = titles[viewName] || titles.inicio;
    document.getElementById('sectionMainTitle').textContent = t;
    document.getElementById('sectionSubTitle').textContent = sub;

    renderAllActiveViews();
  }

  function renderAllActiveViews() {
    renderHeaderAndConfig();
    renderDashboard();
    renderStudentDirectory();
    renderCapturaTable();
    renderWeightedTable();
    renderReportsSection();
  }

  // ===================================================================
  // EVENT LISTENERS & INTERACTION BINDINGS
  // ===================================================================
  function setupEventListeners() {
    // Navigation Buttons (Sidebar + Bottom Dock + Quick GoTo Buttons)
    document.addEventListener('click', (e) => {
      const navBtn = e.target.closest('[data-nav]');
      if (navBtn) {
        switchView(navBtn.dataset.nav);
        return;
      }

      const gotoBtn = e.target.closest('[data-goto]');
      if (gotoBtn) {
        document.getElementById('notificationsPopover')?.classList.add('hidden');
        switchView(gotoBtn.dataset.goto);
        return;
      }

      const openStuBtn = e.target.closest('[data-open-student]');
      if (openStuBtn) {
        openStudentDetailModal(openStuBtn.dataset.openStudent);
        return;
      }

      const editStuBtn = e.target.closest('[data-edit-student]');
      if (editStuBtn) {
        openStudentFormModal(editStuBtn.dataset.editStudent);
        return;
      }

      const delStuBtn = e.target.closest('[data-delete-student]');
      if (delStuBtn) {
        openDeleteConfirmModal(delStuBtn.dataset.deleteStudent);
        return;
      }
    });

    // Global Period Selector
    document.getElementById('globalPeriodSelect').addEventListener('change', (e) => {
      state.currentPeriod = e.target.value;
      const pdfPeriod = document.getElementById('pdfPeriodSelect');
      if (pdfPeriod) pdfPeriod.value = state.currentPeriod;
      saveState(true, 'Periodo cambiado a ' + e.target.options[e.target.selectedIndex].text);
      renderAllActiveViews();
    });

    // Global Search & Mobile Search
    const handleSearchInput = (val) => {
      state.searchQuery = val;
      const gInput = document.getElementById('globalSearchInput');
      const mInput = document.getElementById('mobileSearchInput');
      const dirInput = document.getElementById('studentDirectorySearch');
      if (gInput && gInput.value !== val) gInput.value = val;
      if (mInput && mInput.value !== val) mInput.value = val;
      if (dirInput && dirInput.value !== val) dirInput.value = val;

      const clearBtn = document.getElementById('clearGlobalSearchBtn');
      if (clearBtn) clearBtn.classList.toggle('hidden', !val);

      renderDashboard();
      renderStudentDirectory();
      renderCapturaTable();
      renderWeightedTable();
    };

    document.getElementById('globalSearchInput').addEventListener('input', (e) => handleSearchInput(e.target.value));
    document.getElementById('mobileSearchInput').addEventListener('input', (e) => handleSearchInput(e.target.value));
    document.getElementById('studentDirectorySearch').addEventListener('input', (e) => handleSearchInput(e.target.value));
    document.getElementById('clearGlobalSearchBtn').addEventListener('click', () => handleSearchInput(''));

    // Notifications Popover Toggle
    document.getElementById('notificationsBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('notificationsPopover').classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
      const pop = document.getElementById('notificationsPopover');
      if (pop && !pop.classList.contains('hidden') && !e.target.closest('#notificationsPopover') && !e.target.closest('#notificationsBtn')) {
        pop.classList.add('hidden');
      }
    });

    // Top Bar & Report Section Primary Buttons
    document.getElementById('manualSaveBtn').addEventListener('click', () => saveState(true, 'Todos los registros han sido guardados'));
    document.getElementById('topDownloadExcelBtn').addEventListener('click', exportFullExcelWorkbook);
    document.getElementById('reportDownloadExcelBtn').addEventListener('click', exportFullExcelWorkbook);
    document.getElementById('btnExportStudentListExcel').addEventListener('click', exportFullExcelWorkbook);

    document.getElementById('topGeneratePdfBtn').addEventListener('click', () => {
      switchView('reportes');
      generatePdfReport();
    });
    document.getElementById('reportGeneratePdfBtn').addEventListener('click', () => generatePdfReport());

    // Filters in Dashboard, Alumnos, Captura, Evaluaciones, Reportes
    document.getElementById('dashFilterStatus').addEventListener('change', renderDashboard);
    document.getElementById('studentGradeFilter').addEventListener('change', renderStudentDirectory);
    document.getElementById('studentGenderFilter').addEventListener('change', renderStudentDirectory);
    document.getElementById('capturaFilterSelect').addEventListener('change', renderCapturaTable);
    document.getElementById('evalWeightedFilter').addEventListener('change', renderWeightedTable);

    document.getElementById('pdfReportTypeSelect').addEventListener('change', renderReportsSection);
    document.getElementById('pdfPeriodSelect').addEventListener('change', renderReportLivePreview);
    document.getElementById('pdfStudentSelect').addEventListener('change', renderReportLivePreview);
    document.getElementById('previewQuickIndividualBtn').addEventListener('click', () => {
      document.getElementById('pdfReportTypeSelect').value = 'INDIVIDUAL';
      renderReportsSection();
    });

    // Direct Table Editing in CAPTURA DE CALIFICACIONES (Formative Fields 0-10)
    document.getElementById('capturaTableBody').addEventListener('input', (e) => {
      const input = e.target.closest('[data-cap-id]');
      if (!input) return;

      const stuId = input.dataset.capId;
      const field = input.dataset.capField;
      const rawVal = input.value.trim();

      const s = state.students.find(x => x.id === stuId);
      if (!s) return;

      if (rawVal === '') {
        input.classList.remove('input-error');
        s.grades[state.currentPeriod][field] = null;
      } else {
        let num = Number(rawVal);
        if (isNaN(num) || num < 0 || num > 10) {
          input.classList.add('input-error');
          showToast('La calificación debe estar en escala de 0 a 10');
          num = Math.max(0, Math.min(10, isNaN(num) ? 0 : num));
          input.value = num;
        } else {
          input.classList.remove('input-error');
        }
        s.grades[state.currentPeriod][field] = num;
      }

      // Update row sum, average, and status immediately without losing input focus
      const f = calcFormativeRow(s.grades[state.currentPeriod]);
      const sumCell = document.getElementById(`cap-sum-${stuId}`);
      const promCell = document.getElementById(`cap-prom-${stuId}`);
      const statusCell = document.getElementById(`cap-status-${stuId}`);

      if (sumCell) sumCell.textContent = f.suma.toFixed(1);
      if (promCell) {
        promCell.textContent = f.prom.toFixed(2);
        promCell.className = `py-2 px-3 text-center font-extrabold ${f.prom >= 6 ? 'text-emerald-800' : (f.hasAny ? 'text-rose-700' : 'text-stone-500')} bg-emerald-50/60`;
      }
      if (statusCell) {
        statusCell.innerHTML = f.isComplete
          ? `<span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">✓ Capturado</span>`
          : `<span class="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">⏳ Pendiente</span>`;
      }

      updateCapturaSummaryStrip();
      saveState(false);
    });

    // Keyboard Enter / Arrow Down Navigation in Tables
    const handleTableKeyDown = (e, attrName) => {
      if (e.key !== 'Enter' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      const input = e.target.closest(`[${attrName}]`);
      if (!input) return;
      e.preventDefault();
      const fieldAttr = attrName === 'data-cap-id' ? 'data-cap-field' : 'data-w-field';
      const fieldVal = input.getAttribute(fieldAttr);
      const allSameCol = Array.from(document.querySelectorAll(`input[${fieldAttr}="${fieldVal}"]`));
      const idx = allSameCol.indexOf(input);
      if (idx === -1) return;
      const nextIdx = e.key === 'ArrowUp' ? Math.max(0, idx - 1) : Math.min(allSameCol.length - 1, idx + 1);
      allSameCol[nextIdx]?.focus();
      allSameCol[nextIdx]?.select();
    };

    document.getElementById('capturaTableBody').addEventListener('keydown', (e) => handleTableKeyDown(e, 'data-cap-id'));
    document.getElementById('weightedTableBody').addEventListener('keydown', (e) => handleTableKeyDown(e, 'data-w-id'));

    // Direct Table Editing in CONTROL DE EVALUACIÓN Y PONDERACIONES (100%)
    document.getElementById('weightedTableBody').addEventListener('input', (e) => {
      const input = e.target.closest('[data-w-id]');
      if (!input) return;

      const stuId = input.dataset.wId;
      const field = input.dataset.wField;
      const maxAllowed = Number(input.dataset.wMax);
      const rawVal = input.value.trim();

      const s = state.students.find(x => x.id === stuId);
      if (!s) return;

      if (rawVal === '') {
        input.classList.remove('input-error');
        s.weighted[state.currentPeriod][field] = null;
      } else {
        let num = Number(rawVal);
        if (isNaN(num) || num < 0 || num > maxAllowed) {
          input.classList.add('input-error');
          showToast(`Valor máximo permitido para ${field.toUpperCase()}: ${maxAllowed}`);
          num = Math.max(0, Math.min(maxAllowed, isNaN(num) ? 0 : num));
          input.value = num;
        } else {
          input.classList.remove('input-error');
        }
        s.weighted[state.currentPeriod][field] = num;
      }

      // Update calculated cells for this student row
      const c = calcWeightedRow(s.weighted[state.currentPeriod]);
      const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

      setTxt(`w-pct-examen-${stuId}`, c.hasAny ? (c.pctExamen * 100).toFixed(1) + '%' : '');
      setTxt(`w-pct-tareas-${stuId}`, c.hasAny ? (c.pctTareas * 100).toFixed(1) + '%' : '');
      setTxt(`w-pct-trabajos-${stuId}`, c.hasAny ? (c.pctTrabajos * 100).toFixed(1) + '%' : '');
      setTxt(`w-pct-muestproy-${stuId}`, c.hasAny ? (c.pctMuestProy * 100).toFixed(1) + '%' : '');
      setTxt(`w-pct-part-${stuId}`, c.hasAny ? (c.pctParticipacion * 100).toFixed(1) + '%' : '');
      setTxt(`w-pct-disc-${stuId}`, c.hasAny ? (c.pctDisciplina * 100).toFixed(1) + '%' : '');
      setTxt(`w-totpct-${stuId}`, c.hasAny ? (c.totalPct * 100).toFixed(2) + '%' : '');

      const califEl = document.getElementById(`w-calif-${stuId}`);
      if (califEl) {
        califEl.textContent = c.hasAny ? c.calificacion.toFixed(2) : '';
        califEl.className = `py-1 px-2 text-center font-extrabold text-xs ${c.hasAny ? (c.calificacion >= 6 ? 'text-emerald-800 bg-emerald-50' : 'text-rose-700 bg-rose-50') : ''}`;
      }

      const statusEl = document.getElementById(`w-status-${stuId}`);
      if (statusEl) {
        statusEl.innerHTML = c.hasAny
          ? (c.estatus === 'APROBADO'
              ? '<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">APROBADO</span>'
              : '<span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">REPROBADO</span>')
          : '<span class="text-stone-400 text-[10px]">Pendiente</span>';
      }

      updateWeightedFooterRow();
      saveState(false);
    });

    // Quick Tools in Captura & Evaluaciones
    document.getElementById('btnSyncWeightedToLenguajes').addEventListener('click', () => {
      let count = 0;
      state.students.forEach(s => {
        const wc = calcWeightedRow(s.weighted[state.currentPeriod]);
        if (wc.hasAny) {
          const rounded = Number(wc.calificacion.toFixed(1));
          s.grades[state.currentPeriod].lenguajes = rounded;
          count++;
        }
      });
      saveState(true, `Calificación ponderada vinculada a Lenguajes en ${count} alumnos`);
      renderAllActiveViews();
    });

    document.getElementById('btnFillDemoGrades').addEventListener('click', () => {
      state.students.forEach((s, idx) => {
        const g = s.grades[state.currentPeriod];
        if (g.lenguajes === null) g.lenguajes = Number((7.2 + ((idx * 3) % 26) / 10).toFixed(1));
        if (g.saberes === null) g.saberes = Number((7.0 + ((idx * 5) % 28) / 10).toFixed(1));
        if (g.etica === null) g.etica = Number((7.4 + ((idx * 7) % 24) / 10).toFixed(1));
        if (g.humano === null) g.humano = Number((7.8 + ((idx * 2) % 22) / 10).toFixed(1));
      });
      saveState(true, 'Campos formativos completados para los 35 alumnos');
      renderAllActiveViews();
    });

    document.getElementById('btnClearExamsSheet').addEventListener('click', () => {
      state.students.forEach(s => {
        s.grades[state.currentPeriod] = { lenguajes: null, saberes: null, etica: null, humano: null };
      });
      saveState(true, 'Hoja EXAMENES restablecida en blanco (0, 0) como el Excel original');
      renderAllActiveViews();
    });

    document.getElementById('btnFillRemainingWeightedDemo').addEventListener('click', () => {
      state.students.forEach((s, idx) => {
        const w = s.weighted[state.currentPeriod];
        const c = calcWeightedRow(w);
        if (!c.hasAny) {
          s.weighted[state.currentPeriod] = {
            examen: 13 + (idx % 8),
            tareas: 17 + (idx % 9),
            trabajos: 21 + (idx % 10),
            muestreos: 2 + (idx % 2),
            proyectos: 4 + (idx % 3),
            participacion: 8 + (idx % 3),
            disciplina: 8 + (idx % 3)
          };
        }
      });
      saveState(true, '35 alumnos evaluados en la Hoja de Control Ponderado');
      renderAllActiveViews();
    });

    document.getElementById('btnResetOriginalExcelWeighted').addEventListener('click', () => {
      state.students.forEach(s => {
        const orig = ORIGINAL_HOJA2_SEED[s.no];
        s.weighted[state.currentPeriod] = orig
          ? { ...orig }
          : { examen: null, tareas: null, trabajos: null, muestreos: null, proyectos: null, participacion: null, disciplina: null };
      });
      saveState(true, 'Restaurados exactamente los 5 registros de la Hoja 2 del Excel original');
      renderAllActiveViews();
    });

    // Conversion Tables Modal (Hoja 3)
    const openConversion = () => {
      renderConversionTablesModal();
      document.getElementById('conversionTablesModal').classList.remove('hidden');
    };
    document.getElementById('openConversionModalBtn').addEventListener('click', openConversion);
    document.getElementById('btnOpenConversionFromEval').addEventListener('click', openConversion);
    document.getElementById('closeConversionModalBtn').addEventListener('click', () => {
      document.getElementById('conversionTablesModal').classList.add('hidden');
    });

    // Student Detail Modal Controls
    document.getElementById('closeStudentDetailModalBtn').addEventListener('click', () => {
      document.getElementById('studentDetailModal').classList.add('hidden');
    });
    document.getElementById('modalPrevStudentBtn').addEventListener('click', () => {
      const idx = state.students.findIndex(x => x.id === activeStudentModalId);
      if (idx > 0) openStudentDetailModal(state.students[idx - 1].id);
    });
    document.getElementById('modalNextStudentBtn').addEventListener('click', () => {
      const idx = state.students.findIndex(x => x.id === activeStudentModalId);
      if (idx !== -1 && idx < state.students.length - 1) openStudentDetailModal(state.students[idx + 1].id);
    });
    document.getElementById('modalDownloadIndividualPdfBtn').addEventListener('click', () => {
      if (activeStudentModalId) generatePdfReport('INDIVIDUAL', activeStudentModalId);
    });

    // Add / Edit Student Modal Controls
    document.getElementById('btnOpenNewStudentModal').addEventListener('click', () => openStudentFormModal(null));
    document.getElementById('dockQuickAddStudentBtn').addEventListener('click', () => openStudentFormModal(null));
    document.getElementById('closeStudentFormModalBtn').addEventListener('click', () => {
      document.getElementById('studentFormModal').classList.add('hidden');
    });
    document.getElementById('cancelStudentFormBtn').addEventListener('click', () => {
      document.getElementById('studentFormModal').classList.add('hidden');
    });

    document.getElementById('studentRecordForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('formStudentId').value;
      const no = Number(document.getElementById('formStudentNo').value);
      const group = document.getElementById('formStudentGroup').value.trim();
      const gender = document.getElementById('formStudentGender').value;
      const name = document.getElementById('formStudentName').value.trim().toUpperCase();
      const notes = document.getElementById('formStudentCurp').value.trim();

      if (!name) return;

      if (id) {
        const stu = state.students.find(x => x.id === id);
        if (stu) {
          stu.no = no;
          stu.group = group;
          stu.gender = gender;
          stu.name = name;
          stu.notes = notes;
        }
        showToast(`Datos de ${name} actualizados`);
      } else {
        const newId = 'stu_' + Date.now();
        const periods = ['DIAGNOSTICO', 'TRIMESTRE_1', 'TRIMESTRE_2', 'TRIMESTRE_3'];
        const grades = {};
        const weighted = {};
        periods.forEach(p => {
          grades[p] = { lenguajes: null, saberes: null, etica: null, humano: null };
          weighted[p] = { examen: null, tareas: null, trabajos: null, muestreos: null, proyectos: null, participacion: null, disciplina: null };
        });
        state.students.push({ id: newId, no, name, gender, group, notes, grades, weighted });
        showToast(`Alumno ${name} registrado en el grupo`);
      }

      state.students.sort((a, b) => a.no - b.no);
      document.getElementById('studentFormModal').classList.add('hidden');
      saveState(false);
      renderAllActiveViews();
    });

    // Delete Student Confirmation Modal
    document.getElementById('cancelDeleteStudentBtn').addEventListener('click', () => {
      document.getElementById('deleteConfirmModal').classList.add('hidden');
      pendingDeleteStudentId = null;
    });
    document.getElementById('confirmDeleteStudentBtn').addEventListener('click', () => {
      if (!pendingDeleteStudentId) return;
      const idx = state.students.findIndex(x => x.id === pendingDeleteStudentId);
      if (idx !== -1) {
        const removedName = state.students[idx].name;
        state.students.splice(idx, 1);
        state.students.forEach((s, i) => { s.no = i + 1; });
        saveState(true, `Alumno ${removedName} eliminado del padrón`);
        renderAllActiveViews();
      }
      document.getElementById('deleteConfirmModal').classList.add('hidden');
      pendingDeleteStudentId = null;
    });

    // Excel File Import Listener (Supports importing "6° A 2026Gm.xlsx" or any updated version)
    document.getElementById('excelImportInput').addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file || typeof XLSX === 'undefined') return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target.result);
          const wb = XLSX.read(data, { type: 'array' });

          // Parse EXAMENES sheet if present
          const examSheetName = wb.SheetNames.find(n => n.toUpperCase().includes('EXAMEN')) || wb.SheetNames[0];
          const wsExam = wb.Sheets[examSheetName];
          const rowsExam = XLSX.utils.sheet_to_json(wsExam, { header: 1, defval: null });

          const importedStudents = [];
          rowsExam.forEach((row) => {
            if (!row || row.length < 2) return;
            const noCandidate = Number(row[0]);
            const nameCandidate = String(row[1] || '').trim();
            if (!isNaN(noCandidate) && noCandidate >= 1 && noCandidate <= 100 && nameCandidate && nameCandidate !== 'NOMBRE DEL ALUMNO') {
              // Preserve existing gender if matching name
              const existing = state.students.find(x => x.name.trim() === nameCandidate);
              const periods = ['DIAGNOSTICO', 'TRIMESTRE_1', 'TRIMESTRE_2', 'TRIMESTRE_3'];
              const grades = existing ? JSON.parse(JSON.stringify(existing.grades)) : {};
              const weighted = existing ? JSON.parse(JSON.stringify(existing.weighted)) : {};

              periods.forEach(p => {
                if (!grades[p]) grades[p] = { lenguajes: null, saberes: null, etica: null, humano: null };
                if (!weighted[p]) weighted[p] = { examen: null, tareas: null, trabajos: null, muestreos: null, proyectos: null, participacion: null, disciplina: null };
              });

              const parseScore = (v) => (v !== null && v !== '' && !isNaN(Number(v))) ? Number(v) : null;
              grades[state.currentPeriod] = {
                lenguajes: parseScore(row[2]),
                saberes: parseScore(row[3]),
                etica: parseScore(row[4]),
                humano: parseScore(row[5])
              };

              importedStudents.push({
                id: existing ? existing.id : 'stu_imp_' + noCandidate,
                no: noCandidate,
                name: nameCandidate,
                gender: existing ? existing.gender : 'M',
                group: state.schoolConfig.group,
                notes: existing ? existing.notes : '',
                grades,
                weighted
              });
            }
          });

          // Also check if Hoja2 (Control de Evaluación) exists in uploaded workbook
          const hoja2Name = wb.SheetNames.find(n => n.toLowerCase().includes('hoja2') || n.toLowerCase().includes('control'));
          if (hoja2Name && importedStudents.length > 0) {
            const wsH2 = wb.Sheets[hoja2Name];
            const rowsH2 = XLSX.utils.sheet_to_json(wsH2, { header: 1, defval: null });
            rowsH2.forEach(r => {
              const no = Number(r[0]);
              const stu = importedStudents.find(x => x.no === no);
              if (stu) {
                const pVal = (v) => (v !== null && v !== '' && !isNaN(Number(v))) ? Number(v) : null;
                stu.weighted[state.currentPeriod] = {
                  examen: pVal(r[2]),
                  tareas: pVal(r[4]),
                  trabajos: pVal(r[6]),
                  muestreos: pVal(r[8]),
                  proyectos: pVal(r[9]),
                  participacion: pVal(r[11]),
                  disciplina: pVal(r[13])
                };
              }
            });
          }

          if (importedStudents.length > 0) {
            state.students = importedStudents;
            saveState(true, `Importados ${importedStudents.length} alumnos desde "${file.name}" respetando los datos originales`);
            renderAllActiveViews();
          } else {
            showToast('No se encontraron registros válidos en el archivo seleccionado.');
          }
        } catch (err) {
          console.error(err);
          showToast('Error al procesar el archivo Excel.');
        }
      };
      reader.readAsArrayBuffer(file);
      e.target.value = '';
    });

    // Configuration & Security Forms
    document.getElementById('schoolConfigForm').addEventListener('submit', (e) => {
      e.preventDefault();
      state.schoolConfig = {
        schoolType: document.getElementById('cfgSchoolType').value.trim(),
        schoolName: document.getElementById('cfgSchoolName').value.trim(),
        cct: document.getElementById('cfgCct').value.trim(),
        zone: document.getElementById('cfgZone').value.trim(),
        region: document.getElementById('cfgRegion').value.trim(),
        phone: document.getElementById('cfgPhone').value.trim(),
        address: document.getElementById('cfgAddress').value.trim(),
        teacher: document.getElementById('cfgTeacher').value.trim(),
        cycle: document.getElementById('cfgCycle').value.trim(),
        group: document.getElementById('cfgGroup').value.trim()
      };
      saveState(true, 'Configuración institucional actualizada');
      renderAllActiveViews();
    });

    document.getElementById('securityConfigForm').addEventListener('submit', (e) => {
      e.preventDefault();
      state.security.username = document.getElementById('cfgUsername').value.trim() || 'docente';
      state.security.password = document.getElementById('cfgPassword').value.trim() || '2026';
      saveState(true, 'Credenciales de seguridad actualizadas');
    });

    // Lock Session & Login Modal
    document.getElementById('lockSessionBtn').addEventListener('click', () => {
      document.getElementById('loginPasswordInput').value = '';
      document.getElementById('loginErrorMsg').classList.add('hidden');
      document.getElementById('authLockModal').classList.remove('hidden');
    });

    document.getElementById('authLoginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const u = document.getElementById('loginUsernameInput').value.trim();
      const p = document.getElementById('loginPasswordInput').value.trim();
      if (u === state.security.username && p === state.security.password) {
        document.getElementById('authLockModal').classList.add('hidden');
        showToast('Sesión desbloqueada · Bienvenida Profra. ' + state.schoolConfig.teacher);
      } else {
        const errEl = document.getElementById('loginErrorMsg');
        errEl.textContent = 'Usuario o contraseña incorrectos (Por defecto: cchavarria / 2026)';
        errEl.classList.remove('hidden');
      }
    });

    // Database JSON Backup & Restore
    document.getElementById('btnExportBackupJson').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Respaldo_SICEP_6A_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Respaldo JSON descargado correctamente');
    });

    document.getElementById('jsonRestoreInput').addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target.result);
          if (parsed && Array.isArray(parsed.students)) {
            state = parsed;
            saveState(true, 'Base de datos restaurada exitosamente desde el respaldo JSON');
            renderAllActiveViews();
          }
        } catch (err) {
          showToast('Archivo de respaldo inválido.');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });

    document.getElementById('btnFactoryResetApp').addEventListener('click', () => {
      state = buildDefaultState();
      saveState(true, 'Sistema restaurado a los datos originales del Excel 6° A 2026Gm.xlsx');
      renderAllActiveViews();
    });
  }

  function openStudentFormModal(studentId) {
    const modal = document.getElementById('studentFormModal');
    const title = document.getElementById('studentFormModalTitle');
    if (studentId) {
      const s = state.students.find(x => x.id === studentId);
      if (!s) return;
      title.textContent = 'Editar Información del Alumno';
      document.getElementById('formStudentId').value = s.id;
      document.getElementById('formStudentNo').value = s.no;
      document.getElementById('formStudentGroup').value = s.group;
      document.getElementById('formStudentGender').value = s.gender;
      document.getElementById('formStudentName').value = s.name;
      document.getElementById('formStudentCurp').value = s.notes || '';
    } else {
      title.textContent = 'Registrar Nuevo Alumno';
      document.getElementById('formStudentId').value = '';
      document.getElementById('formStudentNo').value = state.students.length + 1;
      document.getElementById('formStudentGroup').value = state.schoolConfig.group;
      document.getElementById('formStudentGender').value = 'M';
      document.getElementById('formStudentName').value = '';
      document.getElementById('formStudentCurp').value = '';
    }
    modal.classList.remove('hidden');
  }

  function openDeleteConfirmModal(studentId) {
    const s = state.students.find(x => x.id === studentId);
    if (!s) return;
    pendingDeleteStudentId = s.id;
    document.getElementById('deleteConfirmStudentName').textContent = `${s.no}. ${s.name}`;
    document.getElementById('deleteConfirmModal').classList.remove('hidden');
  }

  // Initialize Application on Load
  window.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    renderAllActiveViews();
  });
})();
