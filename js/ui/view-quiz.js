(function (global) {
  'use strict';

  var MeuRitmo = global.MeuRitmo;

  function renderInvalid(container) {
    MeuRitmo.UI.renderPlaceholder(container, {
      title: 'Questionário indisponível',
      description: 'Não encontramos essa matéria para a sua série.',
      links: [{ href: '#/mapa', label: 'Escolher uma matéria' }]
    });
  }

  MeuRitmo.UI.QuizView = {
    render: function (container, params) {
      var profile = MeuRitmo.Profile.get();
      var subject = MeuRitmo.Subjects.getById(params.subjectId);
      var questions = profile && subject ? MeuRitmo.Questions.get(profile.grade, subject.id) : [];
      var answers = Object.create(null);
      var currentIndex = 0;
      var submitted = false;

      if (!profile || !subject || questions.length !== 5) {
        renderInvalid(container);
        return;
      }

      function answeredCount() {
        return Object.keys(answers).filter(function (questionId) {
          return Number.isInteger(answers[questionId]);
        }).length;
      }

      function renderQuestion() {
        var question = questions[currentIndex];
        var section = document.createElement('section');
        var heading = document.createElement('h1');
        var subjectLabel = document.createElement('p');
        var progress = document.createElement('p');
        var unanswered = document.createElement('p');
        var form = document.createElement('form');
        var questionCard = document.createElement('div');
        var fieldset = document.createElement('fieldset');
        var legend = document.createElement('legend');
        var optionList = document.createElement('div');
        var actions = document.createElement('div');
        var cancel = document.createElement('a');
        var previous = document.createElement('button');
        var next = document.createElement('button');

        function updateAnswerStatus() {
          var answered = answeredCount();
          var remaining = questions.length - answered;

          progress.textContent = 'Questão ' + (currentIndex + 1) + ' de ' + questions.length +
            ' • ' + answered + ' de ' + questions.length + ' respondidas';
          unanswered.textContent = remaining === 0
            ? 'Todas as questões foram respondidas.'
            : remaining + (remaining === 1 ? ' questão sem resposta será considerada incorreta.'
              : ' questões sem resposta serão consideradas incorretas.');
        }

        section.className = 'quiz-shell';
        heading.tabIndex = -1;
        heading.textContent = 'Questionário de ' + subject.name;
        subjectLabel.className = 'eyebrow';
        subjectLabel.textContent = profile.grade + 'º ano do Ensino Médio';
        progress.className = 'quiz-progress';
        unanswered.className = 'quiz-unanswered';
        unanswered.setAttribute('aria-live', 'polite');
        updateAnswerStatus();

        questionCard.className = 'question-card';
        fieldset.className = 'question-fields';
        legend.textContent = question.statement;
        optionList.className = 'answer-options';

        question.options.forEach(function (option, optionIndex) {
          var label = document.createElement('label');
          var input = document.createElement('input');
          var text = document.createElement('span');

          label.className = 'answer-option';
          input.type = 'radio';
          input.name = 'answer-' + question.id;
          input.value = String(optionIndex);
          input.checked = answers[question.id] === optionIndex;
          input.addEventListener('change', function () {
            answers[question.id] = optionIndex;
            updateAnswerStatus();
          });
          text.textContent = option;
          label.appendChild(input);
          label.appendChild(text);
          optionList.appendChild(label);
        });

        fieldset.appendChild(legend);
        fieldset.appendChild(optionList);
        questionCard.appendChild(fieldset);
        actions.className = 'quiz-actions';
        cancel.className = 'button-link secondary';
        cancel.href = '#/mapa';
        cancel.textContent = 'Sair';
        previous.className = 'action-button secondary';
        previous.type = 'button';
        previous.textContent = 'Anterior';
        previous.disabled = currentIndex === 0;
        previous.addEventListener('click', function () {
          currentIndex -= 1;
          renderQuestion();
        });
        next.className = 'action-button';
        next.type = 'submit';
        next.textContent = currentIndex === questions.length - 1 ? 'Enviar avaliação' : 'Próxima';

        actions.appendChild(cancel);
        actions.appendChild(previous);
        actions.appendChild(next);
        form.appendChild(questionCard);
        form.appendChild(actions);
        form.addEventListener('submit', function (event) {
          var result;
          var saved;

          event.preventDefault();
          if (currentIndex < questions.length - 1) {
            currentIndex += 1;
            renderQuestion();
            return;
          }
          if (submitted) {
            return;
          }

          submitted = true;
          next.disabled = true;
          result = MeuRitmo.Scoring.grade(questions, answers);
          saved = MeuRitmo.Assessments.save(Object.assign({
            grade: profile.grade,
            subjectId: subject.id
          }, result));

          if (!saved) {
            submitted = false;
            next.disabled = false;
            unanswered.textContent = 'Não foi possível salvar a avaliação. Tente novamente.';
            return;
          }

          MeuRitmo.UI.ResultView.setCurrent(saved);
          MeuRitmo.App.navigate('#/mapa/resultado');
        });

        section.appendChild(subjectLabel);
        section.appendChild(heading);
        section.appendChild(progress);
        section.appendChild(unanswered);
        section.appendChild(form);
        container.replaceChildren(section);
        document.title = 'Questionário de ' + subject.name + ' | ' + MeuRitmo.Config.appName;
        heading.focus({ preventScroll: true });
      }

      renderQuestion();
    }
  };
}(window));
