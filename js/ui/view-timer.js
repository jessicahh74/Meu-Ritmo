(function (global) {
  'use strict';

  global.MeuRitmo.UI.TimerView = {
    render: function (container) {
      global.MeuRitmo.UI.renderPlaceholder(container, {
        title: 'Ritmo de Estudos',
        description: 'O cronômetro de estudo será disponibilizado nesta área.',
        links: [
          { href: '#/ritmo/historico', label: 'Ver histórico de estudo' }
        ]
      });
    }
  };
}(window));
