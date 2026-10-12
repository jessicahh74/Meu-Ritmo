(function (global) {
  'use strict';

  var MeuRitmo = global.MeuRitmo = global.MeuRitmo || {};
  var SVG_NS = 'http://www.w3.org/2000/svg';

  function svgElement(name, attributes) {
    var element = document.createElementNS(SVG_NS, name);

    Object.keys(attributes || {}).forEach(function (attribute) {
      element.setAttribute(attribute, attributes[attribute]);
    });
    return element;
  }

  function formatShortDate(timestamp) {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    }).format(new Date(timestamp));
  }

  function line(container, series, options) {
    var points = Array.isArray(series) ? series : [];
    var settings = options || {};
    var width = 680;
    var height = 270;
    var plot = { left: 48, right: 20, top: 24, bottom: 48 };
    var plotWidth = width - plot.left - plot.right;
    var plotHeight = height - plot.top - plot.bottom;
    var svg = svgElement('svg', {
      class: 'line-chart',
      viewBox: '0 0 ' + width + ' ' + height,
      role: 'img',
      'aria-label': settings.ariaLabel || 'Gráfico de evolução das avaliações',
      preserveAspectRatio: 'xMidYMid meet'
    });
    var label = svgElement('title');

    label.textContent = settings.ariaLabel || 'Gráfico de evolução das avaliações';
    svg.appendChild(label);

    [0, 20, 40, 60, 80, 100].forEach(function (percent) {
      var y = plot.top + plotHeight - (percent / 100) * plotHeight;
      var gridLine = svgElement('line', {
        x1: plot.left,
        x2: width - plot.right,
        y1: y,
        y2: y,
        class: 'chart-grid-line'
      });
      var tick = svgElement('text', {
        x: plot.left - 8,
        y: y + 4,
        class: 'chart-axis-label',
        'text-anchor': 'end'
      });

      tick.textContent = percent + '%';
      svg.appendChild(gridLine);
      svg.appendChild(tick);
    });

    if (points.length) {
      var coordinates = points.map(function (point, index) {
        return {
          x: points.length === 1
            ? plot.left + plotWidth / 2
            : plot.left + (index / (points.length - 1)) * plotWidth,
          y: plot.top + plotHeight - (point.percent / 100) * plotHeight,
          point: point
        };
      });

      if (coordinates.length > 1) {
        svg.appendChild(svgElement('polyline', {
          points: coordinates.map(function (coordinate) {
            return coordinate.x + ',' + coordinate.y;
          }).join(' '),
          class: 'chart-line'
        }));
      }

      coordinates.forEach(function (coordinate, pointIndex) {
        var labelInterval = Math.ceil(coordinates.length / 6);
        var showLabels = coordinates.length <= 6 || pointIndex % labelInterval === 0 ||
          pointIndex === coordinates.length - 1;
        var band = MeuRitmo.Config.bands[coordinate.point.band];
        var group = svgElement('g', { class: 'chart-point' });
        var pointTitle = svgElement('title');
        var circle = svgElement('circle', {
          cx: coordinate.x,
          cy: coordinate.y,
          r: 7,
          class: 'chart-marker band-fill-' + coordinate.point.band
        });
        var value = svgElement('text', {
          x: coordinate.x,
          y: Math.max(14, coordinate.y - 12),
          class: 'chart-value-label',
          'text-anchor': 'middle'
        });
        var date = svgElement('text', {
          x: coordinate.x,
          y: height - 17,
          class: 'chart-date-label',
          'text-anchor': 'middle'
        });

        pointTitle.textContent = formatShortDate(coordinate.point.takenAt) + ': ' +
          coordinate.point.percent + '%, faixa ' + band.label;
        group.appendChild(pointTitle);
        group.appendChild(circle);
        if (showLabels) {
          value.textContent = coordinate.point.percent + '%';
          date.textContent = formatShortDate(coordinate.point.takenAt);
          group.appendChild(value);
          group.appendChild(date);
        }
        svg.appendChild(group);
      });
    }

    container.replaceChildren(svg);
    return svg;
  }

  MeuRitmo.Charts = MeuRitmo.Charts || {};
  MeuRitmo.Charts.line = line;
}(window));
