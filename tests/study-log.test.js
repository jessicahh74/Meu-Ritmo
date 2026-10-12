(function (global) {
  'use strict';

  var test = global.TestRunner;
  var MeuRitmo = global.MeuRitmo;

  function createBackend(initialValues) {
    var values = Object.assign(Object.create(null), initialValues || {});
    return {
      getItem: function (key) {
        return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : null;
      },
      setItem: function (key, value) { values[key] = String(value); },
      removeItem: function (key) { delete values[key]; }
    };
  }

  function blockedBackend() {
    return {
      getItem: function () { throw new Error('bloqueado'); },
      setItem: function () { throw new Error('bloqueado'); },
      removeItem: function () { throw new Error('bloqueado'); }
    };
  }

  function localTimestamp(year, month, day, hour) {
    return new Date(year, month - 1, day, hour || 12).getTime();
  }

  function session(subjectId, startedAt, focusSeconds, pomodorosCompleted) {
    return {
      subjectId: subjectId,
      startedAt: startedAt,
      endedAt: startedAt + (focusSeconds + 60) * 1000,
      focusSeconds: focusSeconds,
      pomodorosCompleted: pomodorosCompleted || 0
    };
  }

  function setup(options) {
    var settings = options || {};
    var grade = settings.grade === undefined ? 1 : settings.grade;
    var nextId = 0;
    var storage = settings.storage || MeuRitmo.Storage.create(settings.backend || createBackend());
    var service = MeuRitmo.StudyLog.create({
      storage: storage,
      profile: {
        getGrade: function () { return grade; }
      },
      clock: function () {
        return settings.now === undefined
          ? localTimestamp(2026, 1, 14)
          : settings.now;
      },
      newId: function () {
        nextId += 1;
        return 'session-' + nextId;
      }
    });

    return {
      service: service,
      storage: storage,
      setGrade: function (value) { grade = value; }
    };
  }

  test.test('study log salva matéria, série, duração e data local', function () {
    var context = setup({ grade: 2 });
    var startedAt = localTimestamp(2026, 1, 30, 9);
    var saved = context.service.save(session('matematica', startedAt, 1500, 1));

    test.equal(saved.id, 'session-1');
    test.equal(saved.grade, 2);
    test.equal(saved.subjectId, 'matematica');
    test.equal(saved.dateKey, '2026-01-30');
    test.equal(saved.focusSeconds, 1500);
    test.equal(saved.pomodorosCompleted, 1);
    test.deepEqual(context.service.byDay('2026-01-30'), [saved]);
  });

  test.test('study log persiste e recupera sessões em uma nova instância', function () {
    var backend = createBackend();
    var first = setup({ backend: backend, grade: 1 });
    var saved = first.service.save(session('historia', localTimestamp(2026, 2, 2), 600));
    var second = setup({ backend: backend, grade: 1 });

    test.equal(second.service.byDay('2026-02-02')[0].id, saved.id);
  });

  test.test('study log não duplica a mesma sessão', function () {
    var context = setup();
    var studySession = session('portugues', localTimestamp(2026, 1, 10), 900);
    var first = context.service.save(studySession);
    var second = context.service.save(studySession);

    test.equal(second.id, first.id);
    test.equal(context.service.byDay('2026-01-10').length, 1);
  });

  test.test('study log ignora duração zero e sessões inválidas', function () {
    var context = setup();
    var startedAt = localTimestamp(2026, 1, 10);

    test.equal(context.service.save(session('matematica', startedAt, 0)), null);
    test.equal(context.service.save(session('inexistente', startedAt, 60)), null);
    test.equal(context.service.save({
      subjectId: 'matematica', startedAt: startedAt, endedAt: startedAt - 1,
      focusSeconds: 60, pomodorosCompleted: 0
    }), null);
    test.equal(context.service.save({
      subjectId: 'matematica', startedAt: startedAt, endedAt: startedAt + 1000,
      focusSeconds: 60, pomodorosCompleted: 0
    }), null);
    context.setGrade(9);
    test.equal(context.service.save(session('matematica', startedAt, 60)), null);
  });

  test.test('study log descarta registros armazenados inválidos e duplicados', function () {
    var key = MeuRitmo.Config.storagePrefix + MeuRitmo.Config.storageKeys.sessions;
    var startedAt = localTimestamp(2026, 1, 8);
    var valid = {
      id: 'valid', grade: 1, subjectId: 'geografia', startedAt: startedAt,
      endedAt: startedAt + 120000, dateKey: '2026-01-08',
      focusSeconds: 60, pomodorosCompleted: 0
    };
    var values = {};

    values[key] = JSON.stringify([valid, Object.assign({}, valid, { id: 'duplicate' }), {
      id: 'invalid', grade: 1, subjectId: 'geografia', startedAt: startedAt,
      endedAt: startedAt + 120000, dateKey: 'dia-inválido',
      focusSeconds: -1, pomodorosCompleted: 0
    }]);

    test.deepEqual(setup({ backend: createBackend(values) }).service.byDay('2026-01-08'), [valid]);
  });

  test.test('byDay mantém séries separadas', function () {
    var context = setup({ grade: 1 });
    var startedAt = localTimestamp(2026, 1, 9);

    context.service.save(session('matematica', startedAt, 60));
    context.setGrade(2);
    context.service.save(session('portugues', startedAt, 120));
    test.equal(context.service.byDay('2026-01-09').length, 1);
    test.equal(context.service.byDay('2026-01-09')[0].subjectId, 'portugues');
    context.setGrade(1);
    test.equal(context.service.byDay('2026-01-09')[0].subjectId, 'matematica');
  });

  test.test('totalsByDay preenche dias vazios e atravessa virada de mês', function () {
    var context = setup();

    context.service.save(session('matematica', localTimestamp(2026, 1, 30), 60));
    context.service.save(session('portugues', localTimestamp(2026, 1, 30, 15), 30));
    context.service.save(session('historia', localTimestamp(2026, 2, 1), 120));

    test.deepEqual(context.service.totalsByDay('2026-01-30', '2026-02-02'), [
      { dateKey: '2026-01-30', focusSeconds: 90 },
      { dateKey: '2026-01-31', focusSeconds: 0 },
      { dateKey: '2026-02-01', focusSeconds: 120 },
      { dateKey: '2026-02-02', focusSeconds: 0 }
    ]);
  });

  test.test('totalsByWeek agrupa segunda a domingo', function () {
    var context = setup({ now: localTimestamp(2026, 1, 14) });

    context.service.save(session('matematica', localTimestamp(2026, 1, 11), 60));
    context.service.save(session('portugues', localTimestamp(2026, 1, 12), 120));

    test.deepEqual(context.service.totalsByWeek(2), [
      { weekKey: '2026-01-05', focusSeconds: 60 },
      { weekKey: '2026-01-12', focusSeconds: 120 }
    ]);
  });

  test.test('totalsBySubject soma o intervalo por matéria e série atual', function () {
    var context = setup({ grade: 1 });

    context.service.save(session('matematica', localTimestamp(2026, 1, 1), 60));
    context.service.save(session('matematica', localTimestamp(2026, 1, 2), 120));
    context.service.save(session('geografia', localTimestamp(2026, 1, 2), 90));
    context.setGrade(2);
    context.service.save(session('matematica', localTimestamp(2026, 1, 2), 300));
    context.setGrade(1);

    test.deepEqual(context.service.totalsBySubject('2026-01-01', '2026-01-02'), {
      matematica: 180,
      portugues: 0,
      historia: 0,
      geografia: 90
    });
  });

  test.test('study log trata históricos e intervalos vazios', function () {
    var context = setup();

    test.deepEqual(context.service.byDay('inválido'), []);
    test.deepEqual(context.service.totalsByDay('2026-02-02', '2026-02-01'), []);
    test.deepEqual(context.service.totalsByWeek(0), []);
    test.deepEqual(context.service.totalsBySubject('inválido', '2026-02-01'), {
      matematica: 0, portugues: 0, historia: 0, geografia: 0
    });
  });

  test.test('study log funciona com fallback em memória', function () {
    var context = setup({ storage: MeuRitmo.Storage.create(blockedBackend()), grade: 3 });
    var saved = context.service.save(session('portugues', localTimestamp(2026, 1, 5), 300));

    test.equal(context.storage.isPersistent(), false);
    test.equal(saved.grade, 3);
    test.equal(context.service.byDay('2026-01-05')[0].id, saved.id);
  });

  test.test('study log salva diretamente a sessão produzida pelo Pomodoro', function () {
    var timestamp = 10000;
    var timer = MeuRitmo.Pomodoro.create({
      clock: function () { return timestamp; },
      config: { focusMs: 2000, shortBreakMs: 500, longBreakMs: 1000, longBreakEvery: 4 }
    });
    var context = setup({ grade: 2 });
    var saved;

    timer.start('historia');
    timestamp += 2000;
    saved = context.service.save(timer.finish());

    test.equal(saved.grade, 2);
    test.equal(saved.subjectId, 'historia');
    test.equal(saved.focusSeconds, 2);
    test.equal(saved.pomodorosCompleted, 1);
  });
}(window));
