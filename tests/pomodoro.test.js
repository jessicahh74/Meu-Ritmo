(function (global) {
  'use strict';

  var test = global.TestRunner;
  var MeuRitmo = global.MeuRitmo;
  var testConfig = {
    focusMs: 1000,
    shortBreakMs: 300,
    longBreakMs: 700,
    longBreakEvery: 4
  };

  function setup(config) {
    var timestamp = 10000;
    var controller = MeuRitmo.Pomodoro.create({
      clock: function () { return timestamp; },
      config: config || testConfig
    });

    return {
      controller: controller,
      advance: function (milliseconds) { timestamp += milliseconds; },
      setTime: function (value) { timestamp = value; }
    };
  }

  function completeFocusAndBreak(timer) {
    timer.advance(testConfig.focusMs);
    timer.controller.getSnapshot();
    timer.advance(testConfig.shortBreakMs);
    timer.controller.getSnapshot();
  }

  test.test('pomodoro inicia vazio e usa as durações padrão da configuração', function () {
    var timer = setup(MeuRitmo.Config.pomodoro);
    var initial = timer.controller.getSnapshot();

    test.equal(initial.status, 'idle');
    test.equal(initial.subjectId, null);
    test.equal(timer.controller.start('matematica'), true);
    test.equal(timer.controller.getSnapshot().phaseRemainingMs, 25 * 60 * 1000);
  });

  test.test('pomodoro rejeita matéria e configuração inválidas com segurança', function () {
    var timer = setup({ focusMs: -1, shortBreakMs: 0, longBreakMs: NaN, longBreakEvery: 0 });

    test.equal(timer.controller.start('inexistente'), false);
    test.equal(timer.controller.getSnapshot().status, 'idle');
    test.equal(timer.controller.start(null), false);
    test.equal(timer.controller.start('historia'), true);
    test.equal(timer.controller.getSnapshot().phaseRemainingMs, MeuRitmo.Config.pomodoro.focusMs);
  });

  test.test('pomodoro conclui foco e inicia intervalo curto automaticamente', function () {
    var timer = setup();
    var snapshot;

    timer.controller.start('portugues');
    timer.advance(1000);
    snapshot = timer.controller.getSnapshot();

    test.equal(snapshot.phase, 'shortBreak');
    test.equal(snapshot.status, 'running');
    test.equal(snapshot.phaseRemainingMs, 300);
    test.equal(snapshot.focusAccumulatedMs, 1000);
    test.equal(snapshot.pomodorosCompleted, 1);
  });

  test.test('pomodoro pausa e retoma sem contabilizar o período pausado', function () {
    var timer = setup();

    timer.controller.start('matematica');
    timer.advance(400);
    test.equal(timer.controller.pause(), true);
    timer.advance(5000);
    test.equal(timer.controller.getSnapshot().focusAccumulatedMs, 400);
    test.equal(timer.controller.resume(), true);
    timer.advance(600);

    test.equal(timer.controller.getSnapshot().pomodorosCompleted, 1);
    test.equal(timer.controller.getSnapshot().focusAccumulatedMs, 1000);
  });

  test.test('finish encerra foco parcial com timestamps e segundos inteiros', function () {
    var timer = setup();
    var session;

    timer.controller.start('geografia');
    timer.advance(650);
    session = timer.controller.finish();

    test.deepEqual(session, {
      subjectId: 'geografia',
      startedAt: 10000,
      endedAt: 10650,
      focusSeconds: 0,
      pomodorosCompleted: 0
    });
    test.equal(timer.controller.getSnapshot().status, 'idle');
  });

  test.test('finish durante intervalo não contabiliza tempo de descanso', function () {
    var timer = setup();
    var session;

    timer.controller.start('historia');
    timer.advance(1200);
    session = timer.controller.finish();

    test.equal(session.focusSeconds, 1);
    test.equal(session.pomodorosCompleted, 1);
    test.equal(session.endedAt, 11200);
  });

  test.test('pomodoro aguarda ação após o intervalo e inicia novo foco sob comando', function () {
    var timer = setup();
    var waiting;

    timer.controller.start('matematica');
    completeFocusAndBreak(timer);
    waiting = timer.controller.getSnapshot();

    test.equal(waiting.phase, 'shortBreak');
    test.equal(waiting.status, 'waiting');
    timer.advance(5000);
    test.equal(timer.controller.getSnapshot().focusAccumulatedMs, 1000);
    test.equal(timer.controller.startNextFocus(), true);
    test.equal(timer.controller.getSnapshot().phase, 'focus');
  });

  test.test('pomodoro usa intervalo longo depois de quatro focos completos', function () {
    var timer = setup();
    var cycle;

    timer.controller.start('portugues');
    for (cycle = 1; cycle <= 3; cycle += 1) {
      completeFocusAndBreak(timer);
      timer.controller.startNextFocus();
    }
    timer.advance(1000);

    test.equal(timer.controller.getSnapshot().phase, 'longBreak');
    test.equal(timer.controller.getSnapshot().phaseRemainingMs, 700);
    test.equal(timer.controller.getSnapshot().pomodorosCompleted, 4);
  });

  test.test('pomodoro ignora transições inválidas e finish sem início', function () {
    var timer = setup();

    test.equal(timer.controller.pause(), false);
    test.equal(timer.controller.resume(), false);
    test.equal(timer.controller.startNextFocus(), false);
    test.equal(timer.controller.finish(), null);
    timer.controller.start('geografia');
    test.equal(timer.controller.start('historia'), false);
    test.equal(timer.controller.resume(), false);
    test.equal(timer.controller.startNextFocus(), false);
  });

  test.test('pomodoro emite eventos e permite remover listeners', function () {
    var timer = setup();
    var phases = [];
    var ticks = 0;
    var finished = null;
    var stopTicks = timer.controller.on('tick', function () { ticks += 1; });

    timer.controller.on('phase', function (snapshot) { phases.push(snapshot.phase); });
    timer.controller.on('finish', function (session) { finished = session; });
    timer.controller.on('inexistente', function () {});
    timer.controller.start('matematica');
    timer.controller.getSnapshot();
    stopTicks();
    timer.advance(1000);
    timer.controller.getSnapshot();
    timer.controller.finish();

    test.deepEqual(phases, ['focus', 'shortBreak']);
    test.equal(ticks, 1);
    test.equal(finished.subjectId, 'matematica');
  });

  test.test('pomodoro ignora relógio regressivo sem criar tempo de foco', function () {
    var timer = setup();
    var session;

    timer.controller.start('matematica');
    timer.setTime(9000);
    test.equal(timer.controller.getSnapshot().focusAccumulatedMs, 0);
    timer.controller.pause();
    timer.controller.resume();
    timer.setTime(10500);
    test.equal(timer.controller.getSnapshot().focusAccumulatedMs, 500);
    timer.setTime(8000);
    session = timer.controller.finish();
    test.equal(session.endedAt, 10500);
    test.equal(session.focusSeconds, 0);
  });
}(window));
