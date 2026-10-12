(function (global) {
  'use strict';

  var MeuRitmo = global.MeuRitmo = global.MeuRitmo || {};

  function startDateKey(timestamp) {
    var date = new Date(timestamp);

    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - 6);
    return MeuRitmo.Utils.dateKey(date.getTime());
  }

  function reasonFor(percent, band, studiedSeconds) {
    var bandLabel = MeuRitmo.Config.bands[band].label;
    var studyText = studiedSeconds === 0
      ? 'nenhum estudo nos últimos 7 dias'
      : MeuRitmo.Utils.formatDuration(studiedSeconds) + ' de estudo nos últimos 7 dias';

    return 'Desempenho ' + MeuRitmo.Utils.formatPercent(percent) + ' (' + bandLabel +
      ') — ' + studyText + '.';
  }

  function create(options) {
    var settings = options || {};
    var assessments = settings.assessments || MeuRitmo.Assessments;
    var studyLog = settings.studyLog || MeuRitmo.StudyLog;
    var clock = typeof settings.clock === 'function' ? settings.clock : Date.now;

    function suggest(grade) {
      var now;
      var endKey;
      var latest;
      var studied;

      if (!MeuRitmo.Profile.isValidGrade(grade)) {
        return [];
      }

      now = clock();
      endKey = MeuRitmo.Utils.dateKey(now);
      latest = assessments.latestBySubject(grade) || {};
      studied = studyLog.totalsBySubject(startDateKey(now), endKey) || {};

      return MeuRitmo.Subjects.all.map(function (subject, index) {
        var assessment = latest[subject.id];
        var hasAssessment = assessment && Number.isFinite(assessment.percent) &&
          assessment.percent >= 0 && assessment.percent <= 100;
        var percent = hasAssessment ? assessment.percent : null;
        var band = hasAssessment ? MeuRitmo.Scoring.bandFor(percent) : null;
        var seconds = Number(studied[subject.id]);
        var studiedSeconds = Number.isFinite(seconds) && seconds > 0
          ? Math.floor(seconds)
          : 0;

        return {
          subjectId: subject.id,
          percent: percent,
          band: band,
          studiedSecondsLast7d: studiedSeconds,
          reason: hasAssessment
            ? reasonFor(percent, band, studiedSeconds)
            : 'Faça o questionário para descobrir seu nível.',
          subjectOrder: index
        };
      }).sort(function (first, second) {
        if (first.percent === null || second.percent === null) {
          if (first.percent === null && second.percent === null) {
            return first.subjectOrder - second.subjectOrder;
          }
          return first.percent === null ? 1 : -1;
        }

        return first.percent - second.percent ||
          first.studiedSecondsLast7d - second.studiedSecondsLast7d ||
          first.subjectOrder - second.subjectOrder;
      }).map(function (suggestion) {
        delete suggestion.subjectOrder;
        return suggestion;
      });
    }

    return Object.freeze({ suggest: suggest });
  }

  var defaultPriority = create();
  MeuRitmo.Priority = Object.freeze({
    suggest: defaultPriority.suggest,
    create: create
  });
}(window));
