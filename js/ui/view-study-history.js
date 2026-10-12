(function (global) {
  'use strict';

  global.MeuRitmo.UI.StudyHistoryView = {
    render: function (container) {
      global.MeuRitmo.UI.renderPlaceholder(container, {
        title: 'Histórico de estudo',
        description: 'As sessões e os totais de estudo serão exibidos aqui.',
        links: [
          { href: '#/ritmo', label: 'Voltar ao Ritmo' }
        ]
      });
    }
  };
}(window));
