(function (global) {
  'use strict';

  var MeuRitmo = global.MeuRitmo;

  global.MeuRitmo.UI.HomeView = {
    render: function (container) {
      var profile = MeuRitmo.Profile.get();
      var section;
      var title;
      var description;
      var priorityCard;
      var priorityTitle;
      var priorityText;
      var priorityLink;
      var shortcuts;

      if (!profile) {
        MeuRitmo.UI.renderPlaceholder(container, {
          title: 'Seu estudo, no seu ritmo',
          description: 'Descubra onde concentrar seus esforços e organize seu tempo de estudo.',
          links: [
            { href: '#/mapa', label: 'Conhecer o Mapa' },
            { href: '#/ritmo', label: 'Abrir Ritmo de Estudos', secondary: true }
          ]
        });
        return;
      }

      var suggestions = MeuRitmo.Priority.suggest(profile.grade);
      var priority = suggestions.find(function (suggestion) {
        return suggestion.percent !== null;
      });

      section = document.createElement('section');
      title = document.createElement('h1');
      description = document.createElement('p');
      priorityCard = document.createElement('section');
      priorityTitle = document.createElement('h2');
      priorityText = document.createElement('p');
      priorityLink = document.createElement('a');
      shortcuts = document.createElement('div');

      section.className = 'home-shell';
      title.textContent = 'Seu estudo, no seu ritmo';
      description.textContent = 'Descubra onde concentrar seus esforços e organize seu tempo de estudo.';
      priorityCard.className = 'home-priority-card';
      priorityTitle.textContent = 'Estudar agora';
      priorityLink.className = 'button-link';

      if (priority) {
        var subject = MeuRitmo.Subjects.getById(priority.subjectId);
        var band = MeuRitmo.Config.bands[priority.band];
        var badge = document.createElement('span');

        priorityCard.classList.add('band-' + priority.band);
        badge.className = 'priority-badge band-' + priority.band;
        badge.textContent = band.icon + ' Faixa ' + band.label;
        priorityCard.appendChild(badge);
        priorityText.textContent = subject.name + ': ' + priority.reason;
        priorityLink.href = '#/ritmo';
        priorityLink.textContent = 'Estudar ' + subject.name;
        priorityLink.addEventListener('click', function () {
          MeuRitmo.UI.TimerView.selectSubject(priority.subjectId);
        });
      } else {
        priorityText.textContent = 'Faça o Mapa das Dificuldades para descobrir qual matéria precisa de mais atenção.';
        priorityLink.href = '#/mapa';
        priorityLink.textContent = 'Fazer o Mapa';
      }

      shortcuts.className = 'home-shortcuts';
      [
        { href: '#/mapa', label: 'Ver Mapa' },
        { href: '#/ritmo', label: 'Abrir cronômetro' }
      ].forEach(function (data) {
        var link = document.createElement('a');

        link.href = data.href;
        link.textContent = data.label;
        shortcuts.appendChild(link);
      });

      priorityCard.prepend(priorityTitle);
      priorityCard.appendChild(priorityText);
      priorityCard.appendChild(priorityLink);
      section.appendChild(title);
      section.appendChild(description);
      section.appendChild(priorityCard);
      section.appendChild(shortcuts);
      container.replaceChildren(section);
      document.title = 'Seu estudo, no seu ritmo | ' + MeuRitmo.Config.appName;
      container.focus({ preventScroll: true });
    }
  };
}(window));
