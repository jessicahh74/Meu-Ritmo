(function (global) {
  'use strict';

  var test = global.TestRunner;
  var utils = global.MeuRitmo.Utils;

  test.test('newId gera identificadores não vazios e únicos', function () {
    var ids = [];
    var index;

    for (index = 0; index < 100; index += 1) {
      ids.push(utils.newId());
    }

    test.equal(new Set(ids).size, 100);
    test.assert(ids.every(function (id) { return typeof id === 'string' && id.length > 0; }));
  });

  test.test('dateKey usa a data local e preenche zeros', function () {
    test.equal(utils.dateKey(new Date(2026, 0, 2, 23, 30).getTime()), '2026-01-02');
    test.equal(utils.dateKey(new Date(2026, 10, 9, 0, 1).getTime()), '2026-11-09');
  });

  test.test('dateKey trata timestamp inválido', function () {
    test.equal(utils.dateKey('data inválida'), '');
  });

  test.test('weekKey agrupa segunda a domingo', function () {
    test.equal(utils.weekKey(new Date(2026, 8, 7).getTime()), '2026-09-07');
    test.equal(utils.weekKey(new Date(2026, 8, 13).getTime()), '2026-09-07');
    test.equal(utils.weekKey(new Date(2026, 8, 14).getTime()), '2026-09-14');
  });

  test.test('weekKey trata virada de mês e ano', function () {
    test.equal(utils.weekKey(new Date(2025, 11, 31).getTime()), '2025-12-29');
    test.equal(utils.weekKey(new Date(2026, 0, 4).getTime()), '2025-12-29');
    test.equal(utils.weekKey(new Date(2026, 0, 5).getTime()), '2026-01-05');
  });

  test.test('formatDuration produz duração legível', function () {
    test.equal(utils.formatDuration(3725), '1h 02min');
    test.equal(utils.formatDuration(300), '5min');
    test.equal(utils.formatDuration(45), '45s');
    test.equal(utils.formatDuration(-2), '0s');
  });

  test.test('formatPercent arredonda e inclui o símbolo', function () {
    test.equal(utils.formatPercent(79.6), '80%');
    test.equal(utils.formatPercent(0), '0%');
    test.equal(utils.formatPercent('inválido'), '0%');
  });
}(window));
