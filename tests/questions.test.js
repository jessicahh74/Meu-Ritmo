(function (global) {
  'use strict';

  var test = global.TestRunner;
  var Questions = global.MeuRitmo.Questions;
  var Subjects = global.MeuRitmo.Subjects;
  var expectedAnswers = [
    'P(x) = 6 + 2,5x', '2 e 3', '31', '30 cm²', 'R$ 170,00',
    'Desejo apresentar minha experiência profissional.', 'insensível aos sentimentos',
    'A notícia prioriza relatar fatos verificáveis.', 'Ambiguidade do pronome “ela”', 'Personificação',
    'Cidadãos homens, adultos e livres', 'Servidão com obrigações ao senhor',
    'a investigação sobre o ser humano e a natureza', 'venda de indulgências pela Igreja',
    'Protecionismo e busca por metais preciosos', '3 km', 'à Linha do Equador',
    'movimento e acúmulo de tensão entre as placas',
    'Porque a pressão diminui e o ar se resfria ao se expandir',
    'Integração de mercados e redes de comunicação',
    '3.200', '5', '4/5', '2', '24', 'Nacionalismo e idealização do indígena',
    'análise crítica das relações sociais e psicológicas', 'os novos estudantes', 'concessão',
    'A leitura diária deve fazer parte da rotina escolar.',
    'latifúndio, monocultura e trabalho escravizado', 'Comunidades de resistência à escravidão',
    'Separação dos poderes do Estado', 'igualdade dos cidadãos perante a lei',
    'A tentativa das Cortes portuguesas de recolonizar o Brasil',
    'Mudança de fábricas para novas regiões', 'segregação socioespacial e ocupações precárias',
    'envelhecimento da estrutura etária',
    'uma pequena parcela de proprietários controla grande parte das terras', 'Hidrelétrica',
    '3/5', '7', '2', 'R$ 1.210,00', '90π cm³',
    'buscar linguagem experimental e temas ligados ao Brasil',
    'Existem boas razões para revisar o texto.', 'Entreguei o livro à professora.',
    'sustentar uma relação entre acesso e número de empréstimos', 'intertextualidade',
    'aliança entre governo federal e oligarquias estaduais',
    'reunir e regulamentar direitos e relações de trabalho urbano',
    'o desembarque aliado na Normandia', 'a repressão política e os poderes do Executivo',
    'restabelecer e ampliar direitos civis, políticos e sociais',
    'vários centros relevantes de poder econômico e político', 'uma tarifa externa comum',
    'perseguição ou grave ameaça a seus direitos', 'Queima de combustíveis fósseis',
    'articular serviços e fluxos de ampla região'
  ];

  function allQuestions() {
    var result = [];
    [1, 2, 3].forEach(function (grade) {
      Subjects.all.forEach(function (subject) {
        result = result.concat(Questions.get(grade, subject.id));
      });
    });
    return result;
  }

  test.test('Questions.get retorna cinco questões por série e matéria', function () {
    [1, 2, 3].forEach(function (grade) {
      Subjects.all.forEach(function (subject) {
        var questions = Questions.get(grade, subject.id);
        test.equal(questions.length, 5, grade + 'º ano - ' + subject.name);
        test.assert(questions.every(function (question) {
          return question.grade === grade && question.subjectId === subject.id;
        }), 'O conjunto retornado não pode misturar séries ou matérias.');
      });
    });
  });

  test.test('banco contém exatamente 60 identificadores únicos', function () {
    var questions = allQuestions();
    var ids = questions.map(function (question) { return question.id; });

    test.equal(questions.length, 60);
    test.equal(new Set(ids).size, 60);
  });

  test.test('todas as questões têm enunciado, tópico e explicação completos', function () {
    allQuestions().forEach(function (question) {
      test.assert(typeof question.statement === 'string' && question.statement.trim().length >= 20,
        question.id + ' precisa de enunciado completo');
      test.assert(typeof question.topic === 'string' && question.topic.trim().length > 0,
        question.id + ' precisa de tópico');
      test.assert(typeof question.explanation === 'string' && question.explanation.trim().length >= 20,
        question.id + ' precisa de explicação educativa');
    });
  });

  test.test('gabaritos correspondem à chave pedagógica revisada', function () {
    test.deepEqual(allQuestions().map(function (question) {
      return question.options[question.correctIndex];
    }), expectedAnswers);
  });

  test.test('todas as questões têm quatro alternativas distintas e um índice correto válido', function () {
    allQuestions().forEach(function (question) {
      var normalizedOptions = question.options.map(function (option) {
        return option.trim().toLocaleLowerCase('pt-BR');
      });

      test.equal(question.options.length, 4, question.id);
      test.equal(new Set(normalizedOptions).size, 4, question.id + ' contém alternativa duplicada');
      test.assert(question.options.every(function (option) {
        return typeof option === 'string' && option.trim().length > 0;
      }), question.id + ' contém alternativa vazia');
      test.assert(Number.isInteger(question.correctIndex) &&
        question.correctIndex >= 0 && question.correctIndex < question.options.length,
      question.id + ' possui índice correto inválido');
      test.assert(!question.options.some(function (option) {
        return /todas as anteriores/i.test(option);
      }), question.id + ' usa alternativa proibida');
    });
  });

  test.test('banco é compatível com Scoring.grade', function () {
    [1, 2, 3].forEach(function (grade) {
      Subjects.all.forEach(function (subject) {
        var questions = Questions.get(grade, subject.id);
        var answers = {};
        questions.forEach(function (question) {
          answers[question.id] = question.correctIndex;
        });
        var result = global.MeuRitmo.Scoring.grade(questions, answers);
        test.equal(result.correct, 5);
        test.equal(result.percent, 100);
        test.equal(result.band, 'verde');
      });
    });
  });

  test.test('índices corretos estão equilibrados em cada série', function () {
    [1, 2, 3].forEach(function (grade) {
      var counts = [0, 0, 0, 0];

      Subjects.all.forEach(function (subject) {
        Questions.get(grade, subject.id).forEach(function (question) {
          counts[question.correctIndex] += 1;
        });
      });

      test.deepEqual(counts, [5, 5, 5, 5], grade + 'º ano');
    });
  });

  test.test('cada disciplina tem uma questão fácil, três médias e uma difícil', function () {
    [1, 2, 3].forEach(function (grade) {
      Subjects.all.forEach(function (subject) {
        var counts = { easy: 0, medium: 0, hard: 0 };

        Questions.get(grade, subject.id).forEach(function (question) {
          test.assert(Object.prototype.hasOwnProperty.call(counts, question.difficulty),
            question.id + ' possui dificuldade inválida');
          counts[question.difficulty] += 1;
        });

        test.deepEqual(counts, { easy: 1, medium: 3, hard: 1 },
          grade + 'º ano - ' + subject.name);
      });
    });
  });

  test.test('consulta inválida retorna lista vazia', function () {
    test.deepEqual(Questions.get(4, 'matematica'), []);
    test.deepEqual(Questions.get(1, 'inexistente'), []);
  });

  test.test('troca de perfil consulta somente o banco da nova série', function () {
    var savedProfile = null;
    var storage = {
      get: function () { return savedProfile; },
      set: function (key, value) { savedProfile = value; return true; }
    };
    var profile = global.MeuRitmo.Profile.create(storage, function () { return 1000; });

    profile.setGrade(1);
    test.assert(Questions.get(profile.getGrade(), 'portugues').every(function (question) {
      return question.grade === 1;
    }));

    profile.setGrade(3);
    test.assert(Questions.get(profile.getGrade(), 'portugues').every(function (question) {
      return question.grade === 3;
    }));
  });
}(window));
