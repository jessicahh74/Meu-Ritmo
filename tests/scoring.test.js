(function (global) {
  'use strict';

  var test = global.TestRunner;
  var scoring = global.MeuRitmo.Scoring;
  var questions = [
    { id: 'q1', correctIndex: 0 },
    { id: 'q2', correctIndex: 1 },
    { id: 'q3', correctIndex: 2 },
    { id: 'q4', correctIndex: 3 },
    { id: 'q5', correctIndex: 0 }
  ];

  function answersWithCorrectCount(count) {
    var answers = {};

    questions.forEach(function (question, index) {
      answers[question.id] = index < count
        ? question.correctIndex
        : (question.correctIndex + 1) % 4;
    });

    return answers;
  }

  function assessment(subjectId, percent) {
    return { subjectId: subjectId, percent: percent };
  }

  test.test('bandFor respeita todos os limites das faixas', function () {
    test.equal(scoring.bandFor(100), 'verde');
    test.equal(scoring.bandFor(80), 'verde');
    test.equal(scoring.bandFor(79), 'amarelo');
    test.equal(scoring.bandFor(60), 'amarelo');
    test.equal(scoring.bandFor(59), 'laranja');
    test.equal(scoring.bandFor(40), 'laranja');
    test.equal(scoring.bandFor(39), 'vermelho');
    test.equal(scoring.bandFor(0), 'vermelho');
  });

  test.test('grade calcula de 0/5 a 5/5 sem arredondar antes da faixa', function () {
    var expectedBands = ['vermelho', 'vermelho', 'laranja', 'amarelo', 'verde', 'verde'];
    var correct;

    for (correct = 0; correct <= 5; correct += 1) {
      var result = scoring.grade(questions, answersWithCorrectCount(correct));
      test.equal(result.correct, correct);
      test.equal(result.total, 5);
      test.equal(result.percent, correct * 20);
      test.equal(result.band, expectedBands[correct]);
    }
  });

  test.test('grade registra respostas e trata não respondidas como incorretas', function () {
    var result = scoring.grade(questions, { q1: 0, q2: null });

    test.equal(result.correct, 1);
    test.equal(result.answers[0].isCorrect, true);
    test.deepEqual(result.answers[1], {
      questionId: 'q2',
      chosenIndex: null,
      isCorrect: false
    });
    test.equal(result.answers[4].chosenIndex, null);
    test.equal(result.answers[4].isCorrect, false);
  });

  test.test('grade mantém precisão percentual antes da classificação', function () {
    var threeQuestions = questions.slice(0, 3);
    var result = scoring.grade(threeQuestions, { q1: 0 });

    test.equal(result.percent, 100 / 3);
    test.equal(result.band, 'vermelho');
  });

  test.test('rank ordena menor percentual primeiro e não altera a entrada', function () {
    var latest = {
      matematica: assessment('matematica', 80),
      portugues: assessment('portugues', 20),
      historia: assessment('historia', 60),
      geografia: assessment('geografia', 40)
    };
    var before = JSON.stringify(latest);
    var ranked = scoring.rank(latest);

    test.deepEqual(ranked.map(function (item) { return item.subjectId; }), [
      'portugues', 'geografia', 'historia', 'matematica'
    ]);
    test.equal(JSON.stringify(latest), before);
  });

  test.test('rank desempata pela ordem fixa e ignora matérias sem avaliação', function () {
    var ranked = scoring.rank({
      matematica: assessment('matematica', 60),
      historia: assessment('historia', 60)
    });

    test.deepEqual(ranked.map(function (item) { return item.subjectId; }), [
      'matematica', 'historia'
    ]);
    test.deepEqual(scoring.rank({}), []);
  });
}(window));
