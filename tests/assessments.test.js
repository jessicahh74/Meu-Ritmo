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

  function createService(options) {
    var nextId = 0;
    return MeuRitmo.Assessments.create({
      storage: options && options.storage
        ? options.storage
        : MeuRitmo.Storage.create(createBackend()),
      clock: function () { return 9000; },
      newId: function () {
        nextId += 1;
        return 'assessment-' + nextId;
      }
    });
  }

  function resultFor(grade, subjectId, correct, takenAt) {
    var questions = MeuRitmo.Questions.get(grade, subjectId);
    var selected = {};

    questions.forEach(function (question, index) {
      selected[question.id] = index < correct ? question.correctIndex : null;
    });

    return Object.assign({
      grade: grade,
      subjectId: subjectId,
      takenAt: takenAt
    }, MeuRitmo.Scoring.grade(questions, selected));
  }

  test.test('assessments salva registro completo e recupera o histórico', function () {
    var service = createService();
    var input = resultFor(1, 'matematica', 3);
    var saved = service.save(input);

    test.equal(saved.id, 'assessment-1');
    test.equal(saved.takenAt, 9000);
    test.equal(saved.grade, 1);
    test.equal(saved.subjectId, 'matematica');
    test.equal(saved.percent, 60);
    test.equal(saved.band, 'amarelo');
    test.deepEqual(service.history(), [saved]);
    test.assert(saved.answers !== input.answers, 'As respostas devem ser copiadas ao salvar.');
  });

  test.test('assessments rejeita resultados inválidos sem persistir', function () {
    var service = createService();
    var invalidGrade = resultFor(1, 'matematica', 2);
    var invalidSubject = resultFor(1, 'matematica', 2);
    var invalidPercent = resultFor(1, 'matematica', 2);
    var invalidAnswers = resultFor(1, 'matematica', 2);

    invalidGrade.grade = 4;
    invalidSubject.subjectId = 'inexistente';
    invalidPercent.percent = 41;
    invalidAnswers.answers[0].isCorrect = !invalidAnswers.answers[0].isCorrect;

    test.equal(service.save(invalidGrade), null);
    test.equal(service.save(invalidSubject), null);
    test.equal(service.save(invalidPercent), null);
    test.equal(service.save(invalidAnswers), null);
    test.deepEqual(service.history(), []);
  });

  test.test('history ordena por data e combina filtros de série e matéria', function () {
    var service = createService();
    service.save(resultFor(1, 'matematica', 1, 1000));
    service.save(resultFor(2, 'matematica', 2, 4000));
    service.save(resultFor(1, 'portugues', 3, 3000));
    service.save(resultFor(1, 'matematica', 4, 2000));

    test.deepEqual(service.history().map(function (item) { return item.takenAt; }),
      [4000, 3000, 2000, 1000]);
    test.deepEqual(service.history({ grade: 1 }).map(function (item) { return item.takenAt; }),
      [3000, 2000, 1000]);
    test.deepEqual(service.history({ grade: 1, subjectId: 'matematica' })
      .map(function (item) { return item.takenAt; }), [2000, 1000]);
  });

  test.test('latestBySubject mantém as séries isoladas e seleciona a mais recente', function () {
    var service = createService();
    service.save(resultFor(1, 'matematica', 1, 1000));
    service.save(resultFor(2, 'matematica', 5, 5000));
    service.save(resultFor(1, 'matematica', 3, 3000));
    service.save(resultFor(1, 'historia', 2, 2000));

    var firstGrade = service.latestBySubject(1);
    var secondGrade = service.latestBySubject(2);
    test.equal(firstGrade.matematica.percent, 60);
    test.equal(firstGrade.historia.percent, 40);
    test.equal(firstGrade.portugues, undefined);
    test.equal(secondGrade.matematica.percent, 100);
    test.equal(secondGrade.historia, undefined);
  });

  test.test('evolution é cronológica e calcula delta dentro da mesma série', function () {
    var service = createService();
    service.save(resultFor(1, 'geografia', 3, 3000));
    service.save(resultFor(2, 'geografia', 5, 2500));
    service.save(resultFor(1, 'geografia', 1, 1000));
    service.save(resultFor(1, 'geografia', 2, 2000));

    test.deepEqual(service.evolution('geografia', 1), [
      { takenAt: 1000, percent: 20, band: 'vermelho', delta: null },
      { takenAt: 2000, percent: 40, band: 'laranja', delta: 20 },
      { takenAt: 3000, percent: 60, band: 'amarelo', delta: 20 }
    ]);
  });

  test.test('assessments trata lista vazia, filtros inválidos e dados corrompidos', function () {
    var key = MeuRitmo.Config.storagePrefix + MeuRitmo.Config.storageKeys.assessments;
    var backendValues = {};
    var malformedValues = {};
    backendValues[key] = JSON.stringify([
      { id: 'registro-invalido', grade: 9 },
      null
    ]);
    var service = createService({
      storage: MeuRitmo.Storage.create(createBackend(backendValues))
    });

    test.deepEqual(service.history(), []);
    test.deepEqual(service.history({ grade: 9 }), []);
    test.deepEqual(service.history({ subjectId: 'inexistente' }), []);
    test.deepEqual(service.evolution('matematica', 3), []);

    malformedValues[key] = '{json-inválido';
    service = createService({
      storage: MeuRitmo.Storage.create(createBackend(malformedValues))
    });
    test.deepEqual(service.history(), []);
  });

  test.test('assessments usa fallback em memória quando storage está indisponível', function () {
    var storage = MeuRitmo.Storage.create(blockedBackend());
    var service = createService({ storage: storage });
    var saved = service.save(resultFor(3, 'portugues', 4, 7000));

    test.equal(storage.isPersistent(), false);
    test.equal(saved.percent, 80);
    test.equal(service.history({ grade: 3 })[0].id, saved.id);
    test.equal(service.latestBySubject(3).portugues.id, saved.id);
  });
}(window));
