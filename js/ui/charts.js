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

  function bars(container, data, options) {
    var entries = Array.isArray(data) ? data : [];
    var settings = options || {};
    var compact = global.matchMedia && global.matchMedia('(max-width: 31rem)').matches;
    var width = compact ? 340 : 680;
    var height = compact ? 270 : 300;
    var plot = compact
      ? { left: 42, right: 10, top: 38, bottom: 52 }
      : { left: 54, right: 18, top: 38, bottom: 58 };
    var plotWidth = width - plot.left - plot.right;
    var plotHeight = height - plot.top - plot.bottom;
    var values = entries.map(function (entry) {
      var value = Number(entry && entry.value);

      return Number.isFinite(value) && value > 0 ? value : 0;
    });
    var maximum = Math.max.apply(null, values.concat([0]));
    var scaleMaximum = maximum || 1;
    var formatValue = typeof settings.formatValue === 'function'
      ? settings.formatValue
      : function (value) { return String(value); };
    var svg = svgElement('svg', {
      class: 'bar-chart',
      viewBox: '0 0 ' + width + ' ' + height,
      role: 'img',
      'aria-label': settings.ariaLabel || 'Gráfico de barras',
      preserveAspectRatio: 'xMidYMid meet'
    });
    var title = svgElement('title');

    title.textContent = settings.ariaLabel || 'Gráfico de barras';
    svg.appendChild(title);

    [0, 1].forEach(function (position) {
      var y = plot.top + plotHeight - position * plotHeight;
      var tick = svgElement('text', {
        x: plot.left - 8,
        y: y + 4,
        class: 'chart-axis-label',
        'text-anchor': 'end'
      });

      tick.textContent = position === 0 ? formatValue(0) : formatValue(maximum);
      svg.appendChild(svgElement('line', {
        x1: plot.left,
        x2: width - plot.right,
        y1: y,
        y2: y,
        class: 'chart-grid-line'
      }));
      svg.appendChild(tick);
    });

    entries.forEach(function (entry, index) {
      var value = values[index];
      var slotWidth = plotWidth / Math.max(entries.length, 1);
      var barWidth = Math.min(56, slotWidth * 0.58);
      var barHeight = (value / scaleMaximum) * plotHeight;
      var x = plot.left + index * slotWidth + (slotWidth - barWidth) / 2;
      var y = plot.top + plotHeight - barHeight;
      var center = x + barWidth / 2;
      var group = svgElement('g', { class: 'bar-chart-item' });
      var itemTitle = svgElement('title');
      var valueLabel = svgElement('text', {
        x: center,
        y: Math.max(18, y - 9),
        class: 'chart-value-label',
        'text-anchor': 'middle'
      });
      var axisLabel = svgElement('text', {
        x: center,
        y: height - 22,
        class: 'chart-date-label',
        'text-anchor': 'middle'
      });

      itemTitle.textContent = String(entry && entry.label || '') + ': ' + formatValue(value);
      valueLabel.textContent = formatValue(value);
      axisLabel.textContent = String(entry && entry.label || '');
      group.appendChild(itemTitle);
      group.appendChild(svgElement('rect', {
        x: x,
        y: y,
        width: barWidth,
        height: barHeight,
        rx: 5,
        class: 'chart-bar'
      }));
      group.appendChild(valueLabel);
      group.appendChild(axisLabel);
      svg.appendChild(group);
    });

    container.replaceChildren(svg);
    return svg;
  }

  MeuRitmo.Charts = MeuRitmo.Charts || {};
  MeuRitmo.Charts.line = line;
  MeuRitmo.Charts.bars = bars;
}(window));
