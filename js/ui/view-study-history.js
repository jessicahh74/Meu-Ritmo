(function (global) {
  'use strict';

  var MeuRitmo = global.MeuRitmo;

  function dateFromKey(dateKey) {
    var parts = dateKey.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2], 12);
  }

  function addDays(dateKey, numberOfDays) {
    var date = dateFromKey(dateKey);
    date.setDate(date.getDate() + numberOfDays);
    return MeuRitmo.Utils.dateKey(date.getTime());
  }

  function totalSeconds(entries) {
    return entries.reduce(function (total, entry) {
      return total + entry.focusSeconds;
    }, 0);
  }

  function formatDate(dateKey) {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    }).format(dateFromKey(dateKey));
  }

  function formatWeekday(dateKey) {
    return new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
      .format(dateFromKey(dateKey))
      .replace('.', '');
  }

  function formatTime(timestamp) {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  }

  function comparisonText(currentTotal, previousTotal) {
    var difference = currentTotal - previousTotal;

    if (currentTotal === 0 && previousTotal === 0) {
      return 'Sem estudo registrado nas duas semanas.';
    }
    if (difference > 0) {
      return '▲ ' + MeuRitmo.Utils.formatDuration(difference) +
        ' a mais que na semana anterior.';
    }
    if (difference < 0) {
      return '▼ ' + MeuRitmo.Utils.formatDuration(Math.abs(difference)) +
        ' a menos que na semana anterior.';
    }
    return '= Mesmo tempo da semana anterior.';
  }

  function createSummaryCard(label, value, detail) {
    var card = document.createElement('article');
    var title = document.createElement('h2');
    var total = document.createElement('p');

    card.className = 'study-summary-card';
    title.textContent = label;
    total.className = 'study-summary-value';
    total.textContent = value;
    card.appendChild(title);
    card.appendChild(total);
    if (detail) {
      var description = document.createElement('p');

      description.className = 'study-summary-detail';
      description.textContent = detail;
      card.appendChild(description);
    }
    return card;
  }

  function createTodaySection(sessions) {
    var section = document.createElement('section');
    var title = document.createElement('h2');

    section.className = 'study-history-section';
    title.textContent = 'Sessões de hoje';
    section.appendChild(title);

    if (!sessions.length) {
      var empty = document.createElement('p');

      empty.className = 'study-empty-message';
      empty.textContent = 'Nenhuma sessão registrada hoje.';
      section.appendChild(empty);
      return section;
    }

    var list = document.createElement('ul');
    list.className = 'study-session-list';
    sessions.forEach(function (session) {
      var subject = MeuRitmo.Subjects.getById(session.subjectId);
      var item = document.createElement('li');
      var heading = document.createElement('div');
      var name = document.createElement('strong');
      var time = document.createElement('time');
      var duration = document.createElement('span');

      name.textContent = subject.name;
      time.dateTime = new Date(session.startedAt).toISOString();
      time.textContent = formatTime(session.startedAt);
      duration.textContent = MeuRitmo.Utils.formatDuration(session.focusSeconds) +
        ' de foco';
      heading.appendChild(name);
      heading.appendChild(time);
      item.appendChild(heading);
      item.appendChild(duration);
      list.appendChild(item);
    });
    section.appendChild(list);
    return section;
  }

  function createDaysList(days) {
    var list = document.createElement('ul');

    list.className = 'study-day-list';
    days.forEach(function (day) {
      var item = document.createElement('li');
      var label = document.createElement('span');
      var value = document.createElement('strong');

      label.textContent = formatWeekday(day.dateKey) + ', ' + formatDate(day.dateKey);
      value.textContent = MeuRitmo.Utils.formatDuration(day.focusSeconds);
      item.appendChild(label);
      item.appendChild(value);
      list.appendChild(item);
    });
    return list;
  }

  function createSubjectList(totals, suggestions) {
    var list = document.createElement('ul');

    list.className = 'study-subject-list';
    MeuRitmo.Subjects.all.forEach(function (subject) {
      var suggestion = suggestions.find(function (item) {
        return item.subjectId === subject.id;
      });
      var item = document.createElement('li');
      var details = document.createElement('div');
      var name = document.createElement('span');
      var badge = document.createElement('span');
      var value = document.createElement('strong');

      name.textContent = subject.name;
      badge.className = 'priority-badge' +
        (suggestion && suggestion.band ? ' band-' + suggestion.band : '');
      badge.textContent = suggestion && suggestion.band
        ? 'Faixa ' + MeuRitmo.Config.bands[suggestion.band].label
        : 'Sem avaliação';
      value.textContent = MeuRitmo.Utils.formatDuration(totals[subject.id]);
      details.appendChild(name);
      details.appendChild(badge);
      item.appendChild(details);
      item.appendChild(value);
      list.appendChild(item);
    });
    return list;
  }

  MeuRitmo.UI.StudyHistoryView = {
    render: function (container) {
      var profile = MeuRitmo.Profile.get();
      var now = Date.now();
      var todayKey = MeuRitmo.Utils.dateKey(now);
      var currentWeekKey = MeuRitmo.Utils.weekKey(now);
      var previousWeekKey = addDays(currentWeekKey, -7);
      var currentWeekDays = MeuRitmo.StudyLog.totalsByDay(
        currentWeekKey,
        addDays(currentWeekKey, 6)
      );
      var previousWeekDays = MeuRitmo.StudyLog.totalsByDay(
        previousWeekKey,
        addDays(previousWeekKey, 6)
      );
      var todaySessions = MeuRitmo.StudyLog.byDay(todayKey);
      var currentWeekTotal = totalSeconds(currentWeekDays);
      var previousWeekTotal = totalSeconds(previousWeekDays);
      var suggestions = MeuRitmo.Priority.suggest(profile.grade);
      var selectedWeekKey = currentWeekKey;
      var section = document.createElement('section');
      var title = document.createElement('h1');
      var description = document.createElement('p');
      var summaryGrid = document.createElement('div');
      var weekSection = document.createElement('section');
      var weekHeader = document.createElement('div');
      var previousButton = document.createElement('button');
      var weekTitle = document.createElement('h2');
      var nextButton = document.createElement('button');
      var weekContent = document.createElement('div');
      var backLink = document.createElement('a');

      section.className = 'study-history-shell';
      title.textContent = 'Histórico de estudo';
      description.textContent = 'Acompanhe o tempo registrado no ' + profile.grade + 'º ano.';
      summaryGrid.className = 'study-summary-grid';
      summaryGrid.appendChild(createSummaryCard(
        'Hoje',
        MeuRitmo.Utils.formatDuration(totalSeconds(todaySessions))
      ));
      summaryGrid.appendChild(createSummaryCard(
        'Esta semana',
        MeuRitmo.Utils.formatDuration(currentWeekTotal),
        comparisonText(currentWeekTotal, previousWeekTotal)
      ));
      weekSection.className = 'study-history-section study-week-section';
      weekHeader.className = 'study-week-header';
      previousButton.type = 'button';
      previousButton.className = 'action-button secondary';
      previousButton.textContent = '← Semana anterior';
      nextButton.type = 'button';
      nextButton.className = 'action-button secondary';
      nextButton.textContent = 'Próxima semana →';
      weekTitle.tabIndex = -1;
      weekHeader.appendChild(previousButton);
      weekHeader.appendChild(weekTitle);
      weekHeader.appendChild(nextButton);
      weekSection.appendChild(weekHeader);
      weekSection.appendChild(weekContent);
      backLink.className = 'button-link secondary study-back-link';
      backLink.href = '#/ritmo';
      backLink.textContent = 'Voltar ao cronômetro';

      function renderWeek() {
        var endKey = addDays(selectedWeekKey, 6);
        var days = MeuRitmo.StudyLog.totalsByDay(selectedWeekKey, endKey);
        var subjects = MeuRitmo.StudyLog.totalsBySubject(selectedWeekKey, endKey);
        var weekTotal = totalSeconds(days);
        var chartSection = document.createElement('section');
        var chartTitle = document.createElement('h3');
        var chartContainer = document.createElement('div');
        var dailySection = document.createElement('section');
        var dailyTitle = document.createElement('h3');
        var subjectSection = document.createElement('section');
        var subjectTitle = document.createElement('h3');
        var weekTotalText = document.createElement('p');
        var grids = document.createElement('div');

        weekTitle.textContent = formatDate(selectedWeekKey) + ' a ' + formatDate(endKey);
        nextButton.disabled = selectedWeekKey >= currentWeekKey;
        chartSection.className = 'study-week-chart';
        chartTitle.textContent = 'Tempo estudado por dia';
        chartContainer.className = 'study-bar-chart';
        chartSection.appendChild(chartTitle);
        chartSection.appendChild(chartContainer);
        MeuRitmo.Charts.bars(chartContainer, days.map(function (day) {
          return {
            label: formatWeekday(day.dateKey),
            value: day.focusSeconds
          };
        }), {
          ariaLabel: 'Tempo estudado por dia, de ' + formatDate(selectedWeekKey) +
            ' a ' + formatDate(endKey),
          formatValue: MeuRitmo.Utils.formatDuration
        });
        dailyTitle.textContent = 'Total por dia';
        subjectTitle.textContent = 'Total por matéria';
        dailySection.appendChild(dailyTitle);
        dailySection.appendChild(createDaysList(days));
        subjectSection.appendChild(subjectTitle);
        subjectSection.appendChild(createSubjectList(subjects, suggestions));
        weekTotalText.className = 'study-week-total';
        weekTotalText.textContent = 'Total da semana: ' +
          MeuRitmo.Utils.formatDuration(weekTotal);
        grids.className = 'study-week-grids';
        grids.appendChild(dailySection);
        grids.appendChild(subjectSection);
        weekContent.replaceChildren(weekTotalText);

        if (weekTotal === 0) {
          var empty = document.createElement('p');

          empty.className = 'study-empty-message';
          empty.textContent = 'Nenhum estudo registrado nesta semana.';
          weekContent.appendChild(empty);
        }
        weekContent.appendChild(chartSection);
        weekContent.appendChild(grids);
      }

      previousButton.addEventListener('click', function () {
        selectedWeekKey = addDays(selectedWeekKey, -7);
        renderWeek();
        weekTitle.focus({ preventScroll: true });
      });
      nextButton.addEventListener('click', function () {
        if (selectedWeekKey < currentWeekKey) {
          selectedWeekKey = addDays(selectedWeekKey, 7);
          renderWeek();
          weekTitle.focus({ preventScroll: true });
        }
      });

      section.appendChild(title);
      section.appendChild(description);
      section.appendChild(summaryGrid);
      section.appendChild(createTodaySection(todaySessions));
      section.appendChild(weekSection);
      section.appendChild(backLink);
      container.replaceChildren(section);
      renderWeek();
      document.title = 'Histórico de estudo | ' + MeuRitmo.Config.appName;
      container.focus({ preventScroll: true });
    }
  };
}(window));
