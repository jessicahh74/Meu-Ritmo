(function (global) {
  'use strict';

  var test = global.TestRunner;
  var subjects = global.MeuRitmo.Subjects;
  var config = global.MeuRitmo.Config;

  test.test('subjects contém exatamente as quatro matérias esperadas', function () {
    test.deepEqual(subjects.all.map(function (subject) { return subject.id; }), [
      'matematica',
      'portugues',
      'historia',
      'geografia'
    ]);
    test.deepEqual(subjects.all.map(function (subject) { return subject.name; }), [
      'Matemática',
      'Português',
      'História',
      'Geografia'
    ]);
    test.equal(new Set(subjects.all.map(function (subject) { return subject.id; })).size, 4);
  });

  test.test('subjects consulta matéria pelo identificador', function () {
    test.equal(subjects.getById('historia').name, 'História');
    test.equal(subjects.getById('inexistente'), undefined);
  });

  test.test('faixas têm limites, rótulos, ícones e cores configurados', function () {
    var expectedLimits = [80, 60, 40, 0];
    var rootStyles = global.getComputedStyle(document.documentElement);

    test.deepEqual(config.bandOrder, ['verde', 'amarelo', 'laranja', 'vermelho']);
    test.deepEqual(config.bandOrder.map(function (id) {
      return config.bands[id].minPercent;
    }), expectedLimits);

    config.bandOrder.forEach(function (id) {
      var band = config.bands[id];
      test.equal(band.id, id);
      test.assert(typeof band.label === 'string' && band.label.length > 0, id + ' precisa de rótulo');
      test.assert(typeof band.icon === 'string' && band.icon.length > 0, id + ' precisa de ícone');
      test.assert(rootStyles.getPropertyValue(band.colorVariable).trim().length > 0,
        id + ' precisa de variável CSS de cor');
      test.assert(Object.isFrozen(band), id + ' deve ser imutável');
    });
  });
}(window));
