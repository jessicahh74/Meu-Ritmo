(function (global) {
  'use strict';

  var MeuRitmo = global.MeuRitmo = global.MeuRitmo || {};

  function parseDateKey(dateKey) {
    var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateKey || ''));
    var date;

    if (!match) {
      return null;
    }

    date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
    return MeuRitmo.Utils.dateKey(date.getTime()) === dateKey ? date : null;
  }

  function isValidRecord(record) {
    var elapsedSeconds;

    if (!record || typeof record.id !== 'string' || record.id.length === 0 ||
        !MeuRitmo.Profile.isValidGrade(record.grade) ||
        !MeuRitmo.Subjects.getById(record.subjectId) ||
        !Number.isFinite(record.startedAt) || !Number.isFinite(record.endedAt) ||
        record.startedAt < 0 || record.endedAt < record.startedAt ||
        !Number.isInteger(record.focusSeconds) || record.focusSeconds <= 0 ||
        !Number.isInteger(record.pomodorosCompleted) || record.pomodorosCompleted < 0 ||
        record.dateKey !== MeuRitmo.Utils.dateKey(record.startedAt)) {
      return false;
    }

    elapsedSeconds = Math.floor((record.endedAt - record.startedAt) / 1000);
    return record.focusSeconds <= elapsedSeconds;
  }

  function signature(record) {
    return [
      record.grade,
      record.subjectId,
      record.startedAt,
      record.endedAt,
      record.focusSeconds,
      record.pomodorosCompleted
    ].join('|');
  }

  function create(options) {
    var settings = options || {};
    var storage = settings.storage || MeuRitmo.Storage;
    var profile = settings.profile || MeuRitmo.Profile;
    var clock = typeof settings.clock === 'function' ? settings.clock : Date.now;
    var newId = typeof settings.newId === 'function' ? settings.newId : MeuRitmo.Utils.newId;
    var key = MeuRitmo.Config.storageKeys.sessions;

    function readStored() {
      var stored = storage.get(key, []);
      return Array.isArray(stored) ? stored : [];
    }

    function validEntries() {
      var ids = new Set();
      var signatures = new Set();

      return readStored().filter(function (record) {
        var recordSignature;

        if (!isValidRecord(record)) {
          return false;
        }
        recordSignature = signature(record);
        if (ids.has(record.id) || signatures.has(recordSignature)) {
          return false;
        }
        ids.add(record.id);
        signatures.add(recordSignature);
        return true;
      });
    }

    function currentGrade() {
      var grade = profile && typeof profile.getGrade === 'function'
        ? profile.getGrade()
        : null;
      return MeuRitmo.Profile.isValidGrade(grade) ? grade : null;
    }

    function save(session) {
      var grade = currentGrade();
      var record;
      var duplicate;
      var stored;

      if (!grade || !session || !MeuRitmo.Subjects.getById(session.subjectId) ||
          !Number.isFinite(session.startedAt) || !Number.isFinite(session.endedAt) ||
          session.startedAt < 0 || session.endedAt < session.startedAt ||
          !Number.isInteger(session.focusSeconds) || session.focusSeconds <= 0 ||
          !Number.isInteger(session.pomodorosCompleted) || session.pomodorosCompleted < 0 ||
          session.focusSeconds > Math.floor((session.endedAt - session.startedAt) / 1000)) {
        return null;
      }

      record = {
        grade: grade,
        subjectId: session.subjectId,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        dateKey: MeuRitmo.Utils.dateKey(session.startedAt),
        focusSeconds: session.focusSeconds,
        pomodorosCompleted: session.pomodorosCompleted
      };
      duplicate = validEntries().find(function (storedRecord) {
        return signature(storedRecord) === signature(record);
      });
      if (duplicate) {
        return duplicate;
      }

      record = Object.assign({ id: newId() }, record);
      stored = readStored();
      stored.push(record);
      storage.set(key, stored);
      return record;
    }

    function forCurrentGrade() {
      var grade = currentGrade();

      if (!grade) {
        return [];
      }
      return validEntries().filter(function (record) {
        return record.grade === grade;
      });
    }

    function byDay(dateKey) {
      if (!parseDateKey(dateKey)) {
        return [];
      }
      return forCurrentGrade().filter(function (record) {
        return record.dateKey === dateKey;
      });
    }

    function totalsByDay(fromKey, toKey) {
      var from = parseDateKey(fromKey);
      var to = parseDateKey(toKey);
      var totals = {};
      var days = [];
      var cursor;

      if (!from || !to || from > to) {
        return [];
      }

      forCurrentGrade().forEach(function (record) {
        if (record.dateKey >= fromKey && record.dateKey <= toKey) {
          totals[record.dateKey] = (totals[record.dateKey] || 0) + record.focusSeconds;
        }
      });

      cursor = new Date(from.getTime());
      while (cursor <= to) {
        var dateKey = MeuRitmo.Utils.dateKey(cursor.getTime());

        days.push({ dateKey: dateKey, focusSeconds: totals[dateKey] || 0 });
        cursor.setDate(cursor.getDate() + 1);
      }
      return days;
    }

    function totalsByWeek(numberOfWeeks) {
      var currentWeekKey;
      var currentWeek;
      var totals = {};
      var weeks = [];
      var firstWeek;
      var index;

      if (!Number.isInteger(numberOfWeeks) || numberOfWeeks <= 0) {
        return [];
      }

      currentWeekKey = MeuRitmo.Utils.weekKey(clock());
      currentWeek = parseDateKey(currentWeekKey);
      if (!currentWeek) {
        return [];
      }

      forCurrentGrade().forEach(function (record) {
        var weekKey = MeuRitmo.Utils.weekKey(record.startedAt);
        totals[weekKey] = (totals[weekKey] || 0) + record.focusSeconds;
      });

      firstWeek = new Date(currentWeek.getTime());
      firstWeek.setDate(firstWeek.getDate() - (numberOfWeeks - 1) * 7);
      for (index = 0; index < numberOfWeeks; index += 1) {
        var weekKey = MeuRitmo.Utils.dateKey(firstWeek.getTime());

        weeks.push({ weekKey: weekKey, focusSeconds: totals[weekKey] || 0 });
        firstWeek.setDate(firstWeek.getDate() + 7);
      }
      return weeks;
    }

    function totalsBySubject(fromKey, toKey) {
      var totals = {};

      MeuRitmo.Subjects.all.forEach(function (subject) {
        totals[subject.id] = 0;
      });
      if (!parseDateKey(fromKey) || !parseDateKey(toKey) || fromKey > toKey) {
        return totals;
      }

      forCurrentGrade().forEach(function (record) {
        if (record.dateKey >= fromKey && record.dateKey <= toKey) {
          totals[record.subjectId] += record.focusSeconds;
        }
      });
      return totals;
    }

    return Object.freeze({
      save: save,
      byDay: byDay,
      totalsByDay: totalsByDay,
      totalsByWeek: totalsByWeek,
      totalsBySubject: totalsBySubject
    });
  }

  var defaultStudyLog = create();
  MeuRitmo.StudyLog = Object.freeze({
    save: defaultStudyLog.save,
    byDay: defaultStudyLog.byDay,
    totalsByDay: defaultStudyLog.totalsByDay,
    totalsByWeek: defaultStudyLog.totalsByWeek,
    totalsBySubject: defaultStudyLog.totalsBySubject,
    create: create
  });
}(window));
