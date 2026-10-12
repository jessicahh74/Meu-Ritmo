(function (global) {
  'use strict';

  var MeuRitmo = global.MeuRitmo;

  function formatDate(timestamp) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(timestamp));
  }

  function createAction(subject, hasAssessment) {
    var action = document.createElement('a');

    action.className = 'button-link';
    action.href = '#/mapa/avaliar/' + subject.id;
    action.textContent = hasAssessment ? 'Refazer questionário' : 'Fazer questionário';
    return action;
  }

  function createSubjectCard(subject, assessment) {
    var item = document.createElement('li');
    var card = document.createElement('article');
    var name = document.createElement('h2');
    var status = document.createElement('div');

    card.className = 'subject-choice map-subject-card';
    name.textContent = subject.name;
    status.className = 'map-subject-status';

    if (assessment) {
      var band = MeuRitmo.Config.bands[assessment.band];
      var label = document.createElement('p');
      var score = document.createElement('p');
      var bandText = document.createElement('p');
      var date = document.createElement('p');
      var time = document.createElement('time');

      card.classList.add('band-' + assessment.band);
      label.className = 'map-card-label';
      label.textContent = 'Último resultado';
      score.className = 'map-score';
      score.textContent = MeuRitmo.Utils.formatPercent(assessment.percent);
      bandText.className = 'map-band';
      bandText.textContent = band.icon + ' Faixa ' + band.label;
      date.className = 'map-date';
      date.append('Avaliado em ');
      time.dateTime = new Date(assessment.takenAt).toISOString();
      time.textContent = formatDate(assessment.takenAt);
      date.appendChild(time);
      status.appendChild(label);
      status.appendChild(score);
      status.appendChild(bandText);
      status.appendChild(date);
    } else {
      var emptyTitle = document.createElement('p');
      var emptyDescription = document.createElement('p');

      card.classList.add('is-unassessed');
      emptyTitle.className = 'map-empty-title';
      emptyTitle.textContent = 'Ainda não avaliada';
      emptyDescription.className = 'map-empty-description';
      emptyDescription.textContent = 'Responda às cinco questões para descobrir sua faixa.';
      status.appendChild(emptyTitle);
      status.appendChild(emptyDescription);
    }

    card.appendChild(name);
    card.appendChild(status);
    card.appendChild(createAction(subject, Boolean(assessment)));
    item.appendChild(card);
    return item;
  }

  function createRanking(ranked, unassessed) {
    var section = document.createElement('section');
    var title = document.createElement('h2');

    section.className = 'map-ranking';
    section.setAttribute('aria-labelledby', 'focus-ranking-title');
    title.id = 'focus-ranking-title';
    title.textContent = 'Onde focar';
    section.appendChild(title);

    if (ranked.length) {
      var description = document.createElement('p');
      var list = document.createElement('ol');

      description.textContent = 'Da matéria que mais precisa de atenção para a de melhor desempenho.';
      list.className = 'focus-ranking-list';
      ranked.forEach(function (assessment) {
        var subject = MeuRitmo.Subjects.getById(assessment.subjectId);
        var band = MeuRitmo.Config.bands[assessment.band];
        var item = document.createElement('li');
        var name = document.createElement('strong');
        var result = document.createElement('span');

        item.className = 'focus-ranking-item band-' + assessment.band;
        name.textContent = subject.name;
        result.textContent = MeuRitmo.Utils.formatPercent(assessment.percent) +
          ' • ' + band.icon + ' Faixa ' + band.label;
        item.appendChild(name);
        item.appendChild(result);
        list.appendChild(item);
      });
      section.appendChild(description);
      section.appendChild(list);
    } else {
      var empty = document.createElement('p');

      empty.className = 'map-ranking-empty';
      empty.textContent = 'Faça seu primeiro questionário para descobrir onde concentrar seus estudos.';
      section.appendChild(empty);
    }

    if (unassessed.length) {
      var pendingTitle = document.createElement('h3');
      var pendingList = document.createElement('ul');

      pendingTitle.className = 'map-pending-title';
      pendingTitle.textContent = 'Matérias ainda não avaliadas';
      pendingList.className = 'map-pending-list';
      unassessed.forEach(function (subject) {
        var item = document.createElement('li');
        var link = document.createElement('a');

        link.href = '#/mapa/avaliar/' + subject.id;
        link.textContent = 'Avaliar ' + subject.name;
        item.appendChild(link);
        pendingList.appendChild(item);
      });
      section.appendChild(pendingTitle);
      section.appendChild(pendingList);
    }

    return section;
  }

  MeuRitmo.UI.MapView = {
    render: function (container) {
      var profile = MeuRitmo.Profile.get();
      var latest = MeuRitmo.Assessments.latestBySubject(profile.grade);
      var ranked = MeuRitmo.Scoring.rank(latest);
      var unassessed = MeuRitmo.Subjects.all.filter(function (subject) {
        return !latest[subject.id];
      });
      var section = document.createElement('section');
      var title = document.createElement('h1');
      var description = document.createElement('p');
      var note = document.createElement('p');
      var list = document.createElement('ul');
      var historyLink = document.createElement('a');

      section.className = 'assessment-start';
      title.textContent = 'Mapa das Dificuldades';
      description.textContent = 'Acompanhe seu resultado mais recente em cada matéria do ' +
        profile.grade + 'º ano.';
      note.className = 'content-note';
      note.textContent = 'O resultado é um indicativo para orientar seus estudos, não um diagnóstico definitivo.';
      list.className = 'subject-choice-grid';
      historyLink.className = 'button-link secondary map-history-link';
      historyLink.href = '#/mapa/historico';
      historyLink.textContent = 'Histórico de avaliações';

      MeuRitmo.Subjects.all.forEach(function (subject) {
        list.appendChild(createSubjectCard(subject, latest[subject.id]));
      });

      section.appendChild(title);
      section.appendChild(description);
      section.appendChild(note);
      section.appendChild(list);
      section.appendChild(createRanking(ranked, unassessed));
      section.appendChild(historyLink);
      container.replaceChildren(section);
      document.title = 'Mapa das Dificuldades | ' + MeuRitmo.Config.appName;
      container.focus({ preventScroll: true });
    }
  };
}(window));
