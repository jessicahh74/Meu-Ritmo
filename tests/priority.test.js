(function (global) {
  'use strict';

  var test = global.TestRunner;
  var MeuRitmo = global.MeuRitmo;
  var NOW = new Date(2026, 0, 14, 10).getTime();

  function setup(latest, totals, onRange) {
    return MeuRitmo.Priority.create({
      assessments: {
        latestBySubject: function () { return latest || {}; }
      },
      studyLog: {
        totalsBySubject: function (fromKey, toKey) {
          if (onRange) {
            onRange(fromKey, toKey);
          }
          return totals || {};
        }
      },
      clock: function () { return NOW; }
    });
  }

  function assessment(percent) {
    return { percent: percent, band: MeuRitmo.Scoring.bandFor(percent) };
  }

  test.test('priority sem avaliações não marca matéria prioritária', function () {
    var suggestions = setup({}, { matematica: 600 }).suggest(1);

    test.deepEqual(suggestions.map(function (item) { return item.subjectId; }), [
      'matematica', 'portugues', 'historia', 'geografia'
    ]);
    test.assert(suggestions.every(function (item) {
      return item.percent === null && item.band === null &&
        item.reason === 'Faça o questionário para descobrir seu nível.';
    }));
  });

  test.test('priority ordena menor desempenho primeiro e não avaliadas ao final', function () {
    var suggestions = setup({
      matematica: assessment(80),
      historia: assessment(40),
      geografia: assessment(60)
    }).suggest(2);

    test.deepEqual(suggestions.map(function (item) { return item.subjectId; }), [
      'historia', 'geografia', 'matematica', 'portugues'
    ]);
    test.equal(suggestions[0].band, 'laranja');
    test.assert(suggestions[0].reason.indexOf('Desempenho 40%') === 0);
  });

  test.test('priority usa menos estudo recente para desempatar a mesma nota', function () {
    var suggestions = setup({
      matematica: assessment(40),
      portugues: assessment(40),
      historia: assessment(40)
    }, {
      matematica: 1800,
      portugues: 0,
      historia: 600
    }).suggest(1);

    test.deepEqual(suggestions.slice(0, 3).map(function (item) { return item.subjectId; }), [
      'portugues', 'historia', 'matematica'
    ]);
    test.equal(suggestions[1].studiedSecondsLast7d, 600);
  });

  test.test('priority mantém ordem fixa após empates completos', function () {
    var suggestions = setup({
      matematica: assessment(60),
      portugues: assessment(60),
      historia: assessment(60),
      geografia: assessment(60)
    }, {
      matematica: 300, portugues: 300, historia: 300, geografia: 300
    }).suggest(3);

    test.deepEqual(suggestions.map(function (item) { return item.subjectId; }), [
      'matematica', 'portugues', 'historia', 'geografia'
    ]);
  });

  test.test('priority consulta somente os últimos sete dias locais', function () {
    var range;

    setup({}, {}, function (fromKey, toKey) {
      range = [fromKey, toKey];
    }).suggest(1);
    test.deepEqual(range, ['2026-01-08', '2026-01-14']);
  });

  test.test('priority rejeita série e dados de dependências inválidos', function () {
    var service = setup({ matematica: { percent: 150 } }, { matematica: -20 });
    var suggestion = service.suggest(1)[0];

    test.deepEqual(service.suggest(0), []);
    test.equal(suggestion.percent, null);
    test.equal(suggestion.studiedSecondsLast7d, 0);
  });
}(window));
