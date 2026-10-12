(function (global) {
  'use strict';

  global.MeuRitmo.UI.AssessmentHistoryView = {
    render: function (container) {
      global.MeuRitmo.UI.renderPlaceholder(container, {
        title: 'Histórico de avaliações',
        description: 'Sua evolução no Mapa das Dificuldades será exibida aqui.',
        links: [
          { href: '#/mapa', label: 'Voltar ao Mapa' }
        ]
      });
    }
  };
}(window));
