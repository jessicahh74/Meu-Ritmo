(function (global) {
  'use strict';

  var MeuRitmo = global.MeuRitmo;
  var currentAssessment = null;

  function encouragement(band) {
    return {
      verde: 'Ótimo resultado! Continue praticando para consolidar o aprendizado.',
      amarelo: 'Bom caminho! Revise os pontos que ainda geraram dúvida.',
      laranja: 'Você está em evolução. Retome os temas indicados pelo gabarito.',
      vermelho: 'Este conteúdo precisa de mais atenção. Use o resultado para orientar sua revisão.'
    }[band];
  }

  function emptyState(container) {
    MeuRitmo.UI.renderPlaceholder(container, {
      title: 'Nenhum resultado disponível',
      description: 'Conclua um questionário da sua série para visualizar o resultado.',
      links: [{ href: '#/mapa', label: 'Escolher uma matéria' }]
    });
  }

  MeuRitmo.UI.ResultView = {
    setCurrent: function (assessment) {
      currentAssessment = assessment;
    },
    render: function (container) {
      var profile = MeuRitmo.Profile.get();
      var assessment = currentAssessment;
      var subject;
      var questions;
      var answersById;
      var band;
      var section;
      var title;
      var summary;
      var score;
      var bandLine;
      var message;
      var note;
      var reviewTitle;
      var reviewList;
      var actions;

      if (!profile) {
        emptyState(container);
        return;
      }

      if (!assessment || assessment.grade !== profile.grade) {
        assessment = MeuRitmo.Assessments.history({ grade: profile.grade })[0];
      }
      currentAssessment = null;

      if (!assessment) {
        emptyState(container);
        return;
      }

      subject = MeuRitmo.Subjects.getById(assessment.subjectId);
      questions = MeuRitmo.Questions.get(assessment.grade, assessment.subjectId);
      if (!subject || questions.length !== 5) {
        emptyState(container);
        return;
      }

      answersById = {};
      assessment.answers.forEach(function (answer) {
        answersById[answer.questionId] = answer;
      });
      band = MeuRitmo.Config.bands[assessment.band];
      if (!band) {
        emptyState(container);
        return;
      }

      section = document.createElement('section');
      title = document.createElement('h1');
      summary = document.createElement('section');
      score = document.createElement('p');
      bandLine = document.createElement('p');
      message = document.createElement('p');
      note = document.createElement('p');
      reviewTitle = document.createElement('h2');
      reviewList = document.createElement('ol');
      actions = document.createElement('div');

      section.className = 'result-shell';
      title.textContent = 'Resultado de ' + subject.name;
      summary.className = 'result-summary band-' + assessment.band;
      summary.setAttribute('aria-label', 'Faixa ' + band.label);
      score.className = 'result-score';
      score.textContent = assessment.correct + ' de ' + assessment.total + ' acertos • ' +
        MeuRitmo.Utils.formatPercent(assessment.percent);
      bandLine.className = 'result-band';
      bandLine.textContent = band.icon + ' Faixa ' + band.label;
      message.textContent = encouragement(assessment.band);
      note.className = 'content-note';
      note.textContent = 'Este resultado é um indicativo baseado em cinco questões.';
      summary.appendChild(score);
      summary.appendChild(bandLine);
      summary.appendChild(message);
      summary.appendChild(note);

      reviewTitle.textContent = 'Gabarito comentado';
      reviewList.className = 'answer-review-list';
      questions.forEach(function (question) {
        var answer = answersById[question.id];
        var item = document.createElement('li');
        var statement = document.createElement('h3');
        var status = document.createElement('p');
        var chosen = document.createElement('p');
        var correct = document.createElement('p');
        var explanation = document.createElement('p');

        item.className = 'answer-review ' + (answer && answer.isCorrect ? 'is-correct' : 'needs-review');
        statement.textContent = question.statement;
        status.className = 'answer-status';
        status.textContent = answer && answer.isCorrect ? '✓ Resposta correta' : '↻ Vale revisar';
        chosen.textContent = 'Sua resposta: ' +
          (answer && answer.chosenIndex !== null
            ? question.options[answer.chosenIndex]
            : 'Sem resposta');
        correct.textContent = 'Resposta correta: ' + question.options[question.correctIndex];
        explanation.className = 'answer-explanation';
        explanation.textContent = question.explanation;
        item.appendChild(statement);
        item.appendChild(status);
        item.appendChild(chosen);
        item.appendChild(correct);
        item.appendChild(explanation);
        reviewList.appendChild(item);
      });

      actions.className = 'result-actions';
      [
        { href: '#/ritmo', label: 'Estudar esta matéria agora', subjectId: subject.id },
        { href: '#/mapa/avaliar/' + subject.id, label: 'Refazer questionário', secondary: true },
        { href: '#/mapa', label: 'Escolher outra matéria', secondary: true }
      ].forEach(function (linkData) {
        var link = document.createElement('a');
        link.className = 'button-link' + (linkData.secondary ? ' secondary' : '');
        link.href = linkData.href;
        link.textContent = linkData.label;
        if (linkData.subjectId) {
          link.addEventListener('click', function () {
            MeuRitmo.UI.TimerView.selectSubject(linkData.subjectId);
          });
        }
        actions.appendChild(link);
      });

      section.appendChild(title);
      section.appendChild(summary);
      section.appendChild(reviewTitle);
      section.appendChild(reviewList);
      section.appendChild(actions);
      container.replaceChildren(section);
      document.title = 'Resultado de ' + subject.name + ' | ' + MeuRitmo.Config.appName;
      container.focus({ preventScroll: true });
    }
  };
}(window));
