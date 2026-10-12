(function (global) {
  'use strict';

  var MeuRitmo = global.MeuRitmo = global.MeuRitmo || {};
  var idCounter = 0;

  function padTwo(value) {
    return String(value).padStart(2, '0');
  }

  function asDate(timestamp) {
    var date = new Date(timestamp);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  MeuRitmo.Utils = {
    newId: function () {
      idCounter += 1;
      return [
        Date.now().toString(36),
        idCounter.toString(36),
        Math.random().toString(36).slice(2, 10)
      ].join('-');
    },
    dateKey: function (timestamp) {
      var date = asDate(timestamp);

      if (!date) {
        return '';
      }

      return [
        date.getFullYear(),
        padTwo(date.getMonth() + 1),
        padTwo(date.getDate())
      ].join('-');
    },
    weekKey: function (timestamp) {
      var date = asDate(timestamp);
      var daysSinceMonday;

      if (!date) {
        return '';
      }

      daysSinceMonday = (date.getDay() + 6) % 7;
      date.setDate(date.getDate() - daysSinceMonday);
      return this.dateKey(date.getTime());
    },
    formatDuration: function (seconds) {
      var totalSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
      var hours = Math.floor(totalSeconds / 3600);
      var minutes = Math.floor((totalSeconds % 3600) / 60);

      if (hours > 0) {
        return hours + 'h ' + padTwo(minutes) + 'min';
      }

      if (minutes > 0) {
        return minutes + 'min';
      }

      return totalSeconds + 's';
    },
    formatPercent: function (percent) {
      var numericPercent = Number(percent);
      return (Number.isFinite(numericPercent) ? Math.round(numericPercent) : 0) + '%';
    },
    normalizeHash: function (hash) {
      var value = String(hash || '#/').trim();

      if (value === '' || value === '#') {
        return '#/';
      }

      if (value.charAt(0) !== '#') {
        value = '#' + value;
      }

      if (value.length > 2 && value.charAt(value.length - 1) === '/') {
        value = value.slice(0, -1);
      }

      return value;
    }
  };
}(window));
