(function (global) {
  'use strict';

  var MeuRitmo = global.MeuRitmo = global.MeuRitmo || {};
  var EVENT_NAMES = ['tick', 'phase', 'finish'];

  function positiveNumber(value, fallback) {
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }

  function positiveInteger(value, fallback) {
    return Number.isInteger(value) && value > 0 ? value : fallback;
  }

  function create(options) {
    var settings = options || {};
    var clock = typeof settings.clock === 'function' ? settings.clock : Date.now;
    var defaults = MeuRitmo.Config.pomodoro;
    var suppliedConfig = settings.config || {};
    var config = {
      focusMs: positiveNumber(suppliedConfig.focusMs, defaults.focusMs),
      shortBreakMs: positiveNumber(suppliedConfig.shortBreakMs, defaults.shortBreakMs),
      longBreakMs: positiveNumber(suppliedConfig.longBreakMs, defaults.longBreakMs),
      longBreakEvery: positiveInteger(suppliedConfig.longBreakEvery, defaults.longBreakEvery)
    };
    var listeners = { tick: [], phase: [], finish: [] };
    var state = initialState();

    function initialState() {
      return {
        subjectId: null,
        startedAt: null,
        phase: null,
        status: 'idle',
        phaseElapsedMs: 0,
        focusAccumulatedMs: 0,
        pomodorosCompleted: 0,
        lastUpdatedAt: null
      };
    }

    function now() {
      var timestamp;

      try {
        timestamp = Number(clock());
      } catch (error) {
        timestamp = NaN;
      }
      if (Number.isFinite(timestamp)) {
        return timestamp;
      }
      return state.lastUpdatedAt === null ? 0 : state.lastUpdatedAt;
    }

    function phaseDuration() {
      if (state.phase === 'focus') {
        return config.focusMs;
      }
      if (state.phase === 'shortBreak') {
        return config.shortBreakMs;
      }
      if (state.phase === 'longBreak') {
        return config.longBreakMs;
      }
      return 0;
    }

    function snapshot() {
      var duration = phaseDuration();

      return {
        subjectId: state.subjectId,
        startedAt: state.startedAt,
        phase: state.phase,
        status: state.status,
        phaseElapsedMs: state.phaseElapsedMs,
        phaseRemainingMs: Math.max(0, duration - state.phaseElapsedMs),
        focusAccumulatedMs: state.focusAccumulatedMs,
        pomodorosCompleted: state.pomodorosCompleted
      };
    }

    function emit(eventName, payload) {
      listeners[eventName].slice().forEach(function (listener) {
        listener(payload);
      });
    }

    function enterBreak() {
      state.phase = state.pomodorosCompleted % config.longBreakEvery === 0
        ? 'longBreak'
        : 'shortBreak';
      state.phaseElapsedMs = 0;
      emit('phase', snapshot());
    }

    function synchronize(timestamp) {
      var elapsed;

      if (state.status !== 'running') {
        return;
      }

      elapsed = Math.max(0, timestamp - state.lastUpdatedAt);
      state.lastUpdatedAt = Math.max(state.lastUpdatedAt, timestamp);

      while (elapsed > 0 && state.status === 'running') {
        var remaining = phaseDuration() - state.phaseElapsedMs;
        var consumed = Math.min(elapsed, remaining);

        state.phaseElapsedMs += consumed;
        if (state.phase === 'focus') {
          state.focusAccumulatedMs += consumed;
        }
        elapsed -= consumed;

        if (state.phaseElapsedMs === phaseDuration()) {
          if (state.phase === 'focus') {
            state.pomodorosCompleted += 1;
            enterBreak();
          } else {
            state.status = 'waiting';
            emit('phase', snapshot());
          }
        }
      }
    }

    function start(subjectId) {
      var timestamp;

      if (state.status !== 'idle' || !MeuRitmo.Subjects.getById(subjectId)) {
        return false;
      }

      timestamp = now();
      state.subjectId = subjectId;
      state.startedAt = timestamp;
      state.phase = 'focus';
      state.status = 'running';
      state.lastUpdatedAt = timestamp;
      emit('phase', snapshot());
      return true;
    }

    function pause() {
      if (state.status !== 'running') {
        return false;
      }

      synchronize(now());
      if (state.status !== 'running') {
        return false;
      }
      state.status = 'paused';
      return true;
    }

    function resume() {
      if (state.status !== 'paused') {
        return false;
      }

      state.status = 'running';
      state.lastUpdatedAt = Math.max(state.lastUpdatedAt, now());
      return true;
    }

    function startNextFocus() {
      var timestamp = Math.max(state.lastUpdatedAt === null ? 0 : state.lastUpdatedAt, now());

      synchronize(timestamp);
      if (state.status !== 'waiting') {
        return false;
      }

      state.phase = 'focus';
      state.status = 'running';
      state.phaseElapsedMs = 0;
      state.lastUpdatedAt = timestamp;
      emit('phase', snapshot());
      return true;
    }

    function finish() {
      var timestamp;
      var session;

      if (state.status === 'idle') {
        return null;
      }

      timestamp = Math.max(state.lastUpdatedAt === null ? 0 : state.lastUpdatedAt, now());
      synchronize(timestamp);
      session = {
        subjectId: state.subjectId,
        startedAt: state.startedAt,
        endedAt: timestamp,
        focusSeconds: Math.floor(state.focusAccumulatedMs / 1000),
        pomodorosCompleted: state.pomodorosCompleted
      };
      state = initialState();
      emit('finish', session);
      return session;
    }

    function getSnapshot() {
      var current;

      synchronize(now());
      current = snapshot();
      emit('tick', current);
      return current;
    }

    function on(eventName, listener) {
      if (EVENT_NAMES.indexOf(eventName) === -1 || typeof listener !== 'function') {
        return function () {};
      }

      listeners[eventName].push(listener);
      return function () {
        var index = listeners[eventName].indexOf(listener);

        if (index !== -1) {
          listeners[eventName].splice(index, 1);
        }
      };
    }

    return Object.freeze({
      start: start,
      pause: pause,
      resume: resume,
      startNextFocus: startNextFocus,
      finish: finish,
      getSnapshot: getSnapshot,
      on: on
    });
  }

  MeuRitmo.Pomodoro = Object.freeze({ create: create });
}(window));
