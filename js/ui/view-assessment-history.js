(function (global) {
  'use strict';

  var MeuRitmo = global.MeuRitmo;

  function formatDate(timestamp) {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(timestamp));
  }

  function variationText(delta) {
    if (delta === null) {
      return 'Primeira avaliação';
    }
    if (delta > 0) {
      return '▲ +' + delta + ' pontos percentuais';
    }
    if (delta < 0) {
      return '▼ ' + delta + ' pontos percentuais';
    }
    return '= Sem alteração';
  }

  function variationClass(delta) {
    if (delta === null || delta === 0) {
      return 'is-stable';
    }
    return delta > 0 ? 'is-positive' : 'is-negative';
  }

  function deltaByAssessment(grade) {
    var deltas = {};

    MeuRitmo.Subjects.all.forEach(function (subject) {
      var records = MeuRitmo.Assessments.history({
        grade: grade,
        subjectId: subject.id
      }).slice().reverse();
      var evolution = MeuRitmo.Assessments.evolution(subject.id, grade);

      records.forEach(function (record, index) {
        deltas[record.id] = evolution[index].delta;
      });
    });
    return deltas;
  }

  function subjectsWithHistory(grade, selectedSubjectId) {
    return MeuRitmo.Subjects.all.filter(function (subject) {
      return (!selectedSubjectId || subject.id === selectedSubjectId) &&
        MeuRitmo.Assessments.evolution(subject.id, grade).length > 0;
    });
  }

  function createComparison(subject, series) {
    var first = series[0];
    var latest = series[series.length - 1];
    var best = Math.max.apply(null, series.map(function (point) { return point.percent; }));
    var delta = latest.percent - first.percent;
    var card = document.createElement('article');
    var title = document.createElement('h3');
    var results = document.createElement('dl');

    card.className = 'history-comparison-card';
    title.textContent = subject.name;
    [
      ['Primeira', MeuRitmo.Utils.formatPercent(first.percent)],
      ['Mais recente', MeuRitmo.Utils.formatPercent(latest.percent)],
      ['Melhor', MeuRitmo.Utils.formatPercent(best)],
      ['Evolução', variationText(delta)]
    ].forEach(function (entry) {
      var term = document.createElement('dt');
      var value = document.createElement('dd');

      term.textContent = entry[0];
      value.textContent = entry[1];
      if (entry[0] === 'Evolução') {
        value.className = 'history-variation ' + variationClass(delta);
      }
      results.appendChild(term);
      results.appendChild(value);
    });
    card.appendChild(title);
    card.appendChild(results);
    return card;
  }

  function createChart(subject, series) {
    var card = document.createElement('article');
    var title = document.createElement('h3');
    var chart = document.createElement('div');

    card.className = 'history-chart-card';
    title.textContent = subject.name;
    chart.className = 'history-chart';
    card.appendChild(title);
    card.appendChild(chart);
    MeuRitmo.Charts.line(chart, series, {
      ariaLabel: 'Evolução de ' + subject.name + ': ' + series.length +
        (series.length === 1 ? ' avaliação. ' : ' avaliações. ') +
        series.map(function (point) {
          return MeuRitmo.Utils.formatPercent(point.percent) + ', faixa ' +
            MeuRitmo.Config.bands[point.band].label;
        }).join('; ')
    });
    return card;
  }

  function createHistoryItem(assessment, delta) {
    var subject = MeuRitmo.Subjects.getById(assessment.subjectId);
    var band = MeuRitmo.Config.bands[assessment.band];
    var item = document.createElement('li');
    var card = document.createElement('article');
    var heading = document.createElement('div');
    var title = document.createElement('h3');
    var date = document.createElement('time');
    var result = document.createElement('p');
    var bandText = document.createElement('p');
    var variation = document.createElement('p');
    var link = document.createElement('a');

    card.className = 'history-entry band-' + assessment.band;
    heading.className = 'history-entry-heading';
    title.textContent = subject.name;
    date.dateTime = new Date(assessment.takenAt).toISOString();
    date.textContent = formatDate(assessment.takenAt);
    result.className = 'history-entry-score';
    result.textContent = assessment.correct + ' de ' + assessment.total + ' acertos • ' +
      MeuRitmo.Utils.formatPercent(assessment.percent);
    bandText.className = 'history-entry-band';
    bandText.textContent = band.icon + ' Faixa ' + band.label;
    variation.className = 'history-variation ' + variationClass(delta);
    variation.textContent = variationText(delta);
    link.className = 'history-result-link';
    link.href = '#/mapa/resultado';
    link.textContent = 'Ver resultado';
    link.addEventListener('click', function () {
      MeuRitmo.UI.ResultView.setCurrent(assessment);
    });
    heading.appendChild(title);
    heading.appendChild(date);
    card.appendChild(heading);
    card.appendChild(result);
    card.appendChild(bandText);
    card.appendChild(variation);
    card.appendChild(link);
    item.appendChild(card);
    return item;
  }

  function createFilteredEmpty(subjectId) {
    var subject = MeuRitmo.Subjects.getById(subjectId);
    var empty = document.createElement('div');
    var message = document.createElement('p');
    var link = document.createElement('a');

    empty.className = 'history-filter-empty';
    message.textContent = 'Ainda não há avaliações de ' + subject.name + ' nesta série.';
    link.className = 'button-link';
    link.href = '#/mapa/avaliar/' + subject.id;
    link.textContent = 'Avaliar ' + subject.name;
    empty.appendChild(message);
    empty.appendChild(link);
    return empty;
  }

  MeuRitmo.UI.AssessmentHistoryView = {
    render: function (container) {
      var profile = MeuRitmo.Profile.get();
      var allAssessments = MeuRitmo.Assessments.history({ grade: profile.grade });
      var section;
      var title;
      var description;
      var controls;
      var label;
      var select;
      var content;
      var backLink;

      if (!allAssessments.length) {
        MeuRitmo.UI.renderPlaceholder(container, {
          title: 'Seu histórico está vazio',
          description: 'Conclua um questionário do ' + profile.grade +
            'º ano para acompanhar seus resultados e sua evolução.',
          links: [{ href: '#/mapa', label: 'Escolher uma matéria' }]
        });
        document.title = 'Histórico de avaliações | ' + MeuRitmo.Config.appName;
        return;
      }

      section = document.createElement('section');
      title = document.createElement('h1');
      description = document.createElement('p');
      controls = document.createElement('div');
      label = document.createElement('label');
      select = document.createElement('select');
      content = document.createElement('div');
      backLink = document.createElement('a');

      section.className = 'assessment-history';
      title.textContent = 'Histórico de avaliações';
      description.textContent = 'Compare os resultados do ' + profile.grade +
        'º ano e acompanhe sua evolução por matéria.';
      controls.className = 'history-controls';
      label.setAttribute('for', 'history-subject-filter');
      label.textContent = 'Filtrar por matéria';
      select.id = 'history-subject-filter';
      select.appendChild(new Option('Todas as matérias', ''));
      MeuRitmo.Subjects.all.forEach(function (subject) {
        select.appendChild(new Option(subject.name, subject.id));
      });
      controls.appendChild(label);
      controls.appendChild(select);
      backLink.className = 'button-link secondary history-back-link';
      backLink.href = '#/mapa';
      backLink.textContent = 'Voltar ao Mapa';

      function renderContent() {
        var selectedSubjectId = select.value;
        var filters = { grade: profile.grade };
        var assessments;
        var availableSubjects;
        var deltas;
        var comparisonSection;
        var comparisonTitle;
        var comparisonGrid;
        var chartSection;
        var chartTitle;
        var chartGrid;
        var listSection;
        var listTitle;
        var list;

        if (selectedSubjectId) {
          filters.subjectId = selectedSubjectId;
        }
        assessments = MeuRitmo.Assessments.history(filters);
        if (!assessments.length) {
          content.replaceChildren(createFilteredEmpty(selectedSubjectId));
          return;
        }

        availableSubjects = subjectsWithHistory(profile.grade, selectedSubjectId);
        deltas = deltaByAssessment(profile.grade);
        comparisonSection = document.createElement('section');
        comparisonTitle = document.createElement('h2');
        comparisonGrid = document.createElement('div');
        chartSection = document.createElement('section');
        chartTitle = document.createElement('h2');
        chartGrid = document.createElement('div');
        listSection = document.createElement('section');
        listTitle = document.createElement('h2');
        list = document.createElement('ol');

        comparisonSection.className = 'history-section';
        comparisonTitle.textContent = 'Comparação por matéria';
        comparisonGrid.className = 'history-comparison-grid';
        chartSection.className = 'history-section';
        chartTitle.textContent = 'Evolução';
        chartGrid.className = 'history-chart-grid';
        listSection.className = 'history-section';
        listTitle.textContent = 'Avaliações mais recentes';
        list.className = 'assessment-history-list';

        availableSubjects.forEach(function (subject) {
          var series = MeuRitmo.Assessments.evolution(subject.id, profile.grade);

          comparisonGrid.appendChild(createComparison(subject, series));
          chartGrid.appendChild(createChart(subject, series));
        });
        assessments.forEach(function (assessment) {
          list.appendChild(createHistoryItem(assessment, deltas[assessment.id]));
        });

        comparisonSection.appendChild(comparisonTitle);
        comparisonSection.appendChild(comparisonGrid);
        chartSection.appendChild(chartTitle);
        chartSection.appendChild(chartGrid);
        listSection.appendChild(listTitle);
        listSection.appendChild(list);
        content.replaceChildren(comparisonSection, chartSection, listSection);
      }

      select.addEventListener('change', renderContent);
      section.appendChild(title);
      section.appendChild(description);
      section.appendChild(controls);
      section.appendChild(content);
      section.appendChild(backLink);
      container.replaceChildren(section);
      renderContent();
      document.title = 'Histórico de avaliações | ' + MeuRitmo.Config.appName;
      container.focus({ preventScroll: true });
    }
  };
}(window));
