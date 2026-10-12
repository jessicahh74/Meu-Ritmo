(function (global) {
  'use strict';

  var MeuRitmo = global.MeuRitmo = global.MeuRitmo || {};
  var bands = {
    verde: Object.freeze({
      id: 'verde',
      label: 'Verde',
      icon: '✓',
      minPercent: 80,
      colorVariable: '--band-verde'
    }),
    amarelo: Object.freeze({
      id: 'amarelo',
      label: 'Amarelo',
      icon: '●',
      minPercent: 60,
      colorVariable: '--band-amarelo'
    }),
    laranja: Object.freeze({
      id: 'laranja',
      label: 'Laranja',
      icon: '▲',
      minPercent: 40,
      colorVariable: '--band-laranja'
    }),
    vermelho: Object.freeze({
      id: 'vermelho',
      label: 'Vermelho',
      icon: '!',
      minPercent: 0,
      colorVariable: '--band-vermelho'
    })
  };

  MeuRitmo.Config = Object.freeze({
    appName: 'Meu Ritmo',
    schemaVersion: 1,
    storagePrefix: 'meuRitmo:v1:',
    storageKeys: Object.freeze({
      profile: 'profile',
      assessments: 'assessments'
    }),
    bandOrder: Object.freeze(['verde', 'amarelo', 'laranja', 'vermelho']),
    bands: Object.freeze(bands),
    routes: Object.freeze({
      home: '#/',
      map: '#/mapa',
      quiz: '#/mapa/avaliar/:subjectId',
      result: '#/mapa/resultado',
      assessmentHistory: '#/mapa/historico',
      timer: '#/ritmo',
      studyHistory: '#/ritmo/historico'
    })
  });
}(window));
