(function (global) {
  'use strict';

  var MeuRitmo = global.MeuRitmo = global.MeuRitmo || {};

  function isValidAnswer(answer) {
    return answer &&
      typeof answer.questionId === 'string' && answer.questionId.length > 0 &&
      (answer.chosenIndex === null ||
        (Number.isInteger(answer.chosenIndex) && answer.chosenIndex >= 0 && answer.chosenIndex <= 3)) &&
      typeof answer.isCorrect === 'boolean';
  }

  function hasValidAnswers(answers, total, correct) {
    var questionIds;

    if (!Array.isArray(answers) || answers.length !== total || !answers.every(isValidAnswer)) {
      return false;
    }

    questionIds = answers.map(function (answer) { return answer.questionId; });
    return new Set(questionIds).size === total &&
      answers.filter(function (answer) { return answer.isCorrect; }).length === correct;
  }

  function isValidRecord(record) {
    var expectedPercent;

    if (!record || typeof record.id !== 'string' || record.id.length === 0 ||
        !MeuRitmo.Profile.isValidGrade(record.grade) ||
        !MeuRitmo.Subjects.getById(record.subjectId) ||
        !Number.isFinite(record.takenAt) || record.total !== 5 ||
        !Number.isInteger(record.correct) || record.correct < 0 || record.correct > record.total) {
      return false;
    }

    expectedPercent = (record.correct * 100) / record.total;
    return record.percent === expectedPercent &&
      record.band === MeuRitmo.Scoring.bandFor(record.percent) &&
      hasValidAnswers(record.answers, record.total, record.correct);
  }

  function create(options) {
    var settings = options || {};
    var storage = settings.storage || MeuRitmo.Storage;
    var clock = typeof settings.clock === 'function' ? settings.clock : Date.now;
    var newId = typeof settings.newId === 'function' ? settings.newId : MeuRitmo.Utils.newId;
    var key = MeuRitmo.Config.storageKeys.assessments;

    function readStored() {
      var stored = storage.get(key, []);
      return Array.isArray(stored) ? stored : [];
    }

    function validEntries() {
      return readStored()
        .map(function (record, index) {
          return { record: record, storageIndex: index };
        })
        .filter(function (entry) {
          return isValidRecord(entry.record);
        });
    }

    function save(result) {
      var takenAt;
      var expectedPercent;
      var record;
      var stored;

      if (!result || !MeuRitmo.Profile.isValidGrade(result.grade) ||
          !MeuRitmo.Subjects.getById(result.subjectId) || result.total !== 5 ||
          !Number.isInteger(result.correct) || result.correct < 0 || result.correct > result.total ||
          !hasValidAnswers(result.answers, result.total, result.correct)) {
        return null;
      }

      expectedPercent = (result.correct * 100) / result.total;
      if (result.percent !== expectedPercent) {
        return null;
      }

      takenAt = result.takenAt === undefined ? clock() : result.takenAt;
      if (!Number.isFinite(takenAt)) {
        return null;
      }

      record = {
        id: newId(),
        grade: result.grade,
        subjectId: result.subjectId,
        takenAt: takenAt,
        total: result.total,
        correct: result.correct,
        percent: result.percent,
        band: MeuRitmo.Scoring.bandFor(result.percent),
        answers: result.answers.map(function (answer) {
          return {
            questionId: answer.questionId,
            chosenIndex: answer.chosenIndex,
            isCorrect: answer.isCorrect
          };
        })
      };

      stored = readStored();
      stored.push(record);
      storage.set(key, stored);
      return record;
    }

    function history(filters) {
      var appliedFilters = filters || {};

      if (appliedFilters.grade !== undefined &&
          !MeuRitmo.Profile.isValidGrade(appliedFilters.grade)) {
        return [];
      }
      if (appliedFilters.subjectId !== undefined &&
          !MeuRitmo.Subjects.getById(appliedFilters.subjectId)) {
        return [];
      }

      return validEntries()
        .filter(function (entry) {
          return (appliedFilters.grade === undefined || entry.record.grade === appliedFilters.grade) &&
            (appliedFilters.subjectId === undefined ||
              entry.record.subjectId === appliedFilters.subjectId);
        })
        .sort(function (first, second) {
          return second.record.takenAt - first.record.takenAt ||
            second.storageIndex - first.storageIndex;
        })
        .map(function (entry) { return entry.record; });
    }

    function latestBySubject(grade) {
      var latest = {};

      MeuRitmo.Subjects.all.forEach(function (subject) {
        latest[subject.id] = undefined;
      });

      if (!MeuRitmo.Profile.isValidGrade(grade)) {
        return latest;
      }

      history({ grade: grade }).forEach(function (record) {
        if (latest[record.subjectId] === undefined) {
          latest[record.subjectId] = record;
        }
      });
      return latest;
    }

    function evolution(subjectId, grade) {
      if (!MeuRitmo.Subjects.getById(subjectId) || !MeuRitmo.Profile.isValidGrade(grade)) {
        return [];
      }

      return validEntries()
        .filter(function (entry) {
          return entry.record.subjectId === subjectId && entry.record.grade === grade;
        })
        .sort(function (first, second) {
          return first.record.takenAt - second.record.takenAt ||
            first.storageIndex - second.storageIndex;
        })
        .map(function (entry, index, entries) {
          return {
            takenAt: entry.record.takenAt,
            percent: entry.record.percent,
            band: entry.record.band,
            delta: index === 0 ? null : entry.record.percent - entries[index - 1].record.percent
          };
        });
    }

    return Object.freeze({
      save: save,
      history: history,
      latestBySubject: latestBySubject,
      evolution: evolution
    });
  }

  var defaultAssessments = create();
  MeuRitmo.Assessments = Object.freeze({
    save: defaultAssessments.save,
    history: defaultAssessments.history,
    latestBySubject: defaultAssessments.latestBySubject,
    evolution: defaultAssessments.evolution,
    create: create
  });
}(window));
