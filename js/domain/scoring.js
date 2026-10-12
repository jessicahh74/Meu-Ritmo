(function (global) {
  'use strict';

  var MeuRitmo = global.MeuRitmo = global.MeuRitmo || {};

  function bandFor(percent) {
    var numericPercent = Number(percent);
    var bandId;

    if (!Number.isFinite(numericPercent)) {
      numericPercent = 0;
    }

    bandId = MeuRitmo.Config.bandOrder.find(function (id) {
      return numericPercent >= MeuRitmo.Config.bands[id].minPercent;
    });

    return bandId || 'vermelho';
  }

  function grade(questions, answersByQuestionId) {
    var safeQuestions = Array.isArray(questions) ? questions : [];
    var safeAnswers = answersByQuestionId || {};
    var correct = 0;
    var answers = safeQuestions.map(function (question) {
      var hasAnswer = Object.prototype.hasOwnProperty.call(safeAnswers, question.id);
      var chosenIndex = hasAnswer && Number.isInteger(safeAnswers[question.id])
        ? safeAnswers[question.id]
        : null;
      var isCorrect = chosenIndex === question.correctIndex;

      if (isCorrect) {
        correct += 1;
      }

      return {
        questionId: question.id,
        chosenIndex: chosenIndex,
        isCorrect: isCorrect
      };
    });
    var total = safeQuestions.length;
    var percent = total === 0 ? 0 : (correct * 100) / total;

    return {
      correct: correct,
      total: total,
      percent: percent,
      band: bandFor(percent),
      answers: answers
    };
  }

  function rank(latestBySubject) {
    var assessments = latestBySubject || {};

    return MeuRitmo.Subjects.all
      .map(function (subject, subjectIndex) {
        return {
          assessment: assessments[subject.id],
          subjectIndex: subjectIndex
        };
      })
      .filter(function (entry) {
        return entry.assessment && Number.isFinite(entry.assessment.percent);
      })
      .sort(function (first, second) {
        return first.assessment.percent - second.assessment.percent ||
          first.subjectIndex - second.subjectIndex;
      })
      .map(function (entry) {
        return entry.assessment;
      });
  }

  MeuRitmo.Scoring = Object.freeze({
    grade: grade,
    bandFor: bandFor,
    rank: rank
  });
}(window));
