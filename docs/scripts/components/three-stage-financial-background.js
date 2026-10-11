(function () {
  'use strict';

  var globalSection = document.querySelector('.section-bg-global-markets');
  var capitalSection = globalSection && globalSection.nextElementSibling;
  var toolsSection = capitalSection && capitalSection.nextElementSibling;
  if (!globalSection || !capitalSection || !toolsSection) return;

  var compact = window.matchMedia('(max-width: 767px)');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var instances = [];

  function createCanvas(section, className, renderer) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!context) return null;

    canvas.className = 'ymc-stage-canvas ' + className;
    canvas.setAttribute('aria-hidden', 'true');
    var stageClass = className === 'ymc-global-canvas'
      ? 'ymc-stage-global'
      : className === 'ymc-capital-grid-canvas' ? 'ymc-stage-capital' : 'ymc-stage-tools';
    section.classList.add('ymc-financial-stage', stageClass);
    section.prepend(canvas);

    var instance = {
      section: section,
      canvas: canvas,
      context: context,
      renderer: renderer,
      width: 1,
      height: 1,
      ratio: 1,
      visible: true,
      lastFrame: 0
    };

    instance.resize = function () {
      var bounds = section.getBoundingClientRect();
      instance.width = Math.max(1, Math.round(bounds.width));
      instance.height = Math.max(1, Math.round(bounds.height));
      instance.ratio = Math.min(window.devicePixelRatio || 1, compact.matches ? 1.25 : 1.7);
      canvas.width = Math.round(instance.width * instance.ratio);
      canvas.height = Math.round(instance.height * instance.ratio);
      canvas.style.width = instance.width + 'px';
      canvas.style.height = instance.height + 'px';
      context.setTransform(instance.ratio, 0, 0, instance.ratio, 0, 0);
      renderer(instance, performance.now(), true);
    };

    instance.observer = new ResizeObserver(instance.resize);
    instance.observer.observe(section);
    instance.resize();
    instances.push(instance);
    return instance;
  }

  function ellipse(x, y, cx, cy, rx, ry) {
    var dx = (x - cx) / rx;
    var dy = (y - cy) / ry;
    return dx * dx + dy * dy < 1;
  }

  function isLand(x, y) {
    var northAmerica = ellipse(x, y, 0.23, 0.35, 0.16, 0.16) || ellipse(x, y, 0.15, 0.28, 0.09, 0.1);
    var southAmerica = ellipse(x, y, 0.34, 0.63, 0.075, 0.2);
    var europe = ellipse(x, y, 0.5, 0.34, 0.08, 0.07);
    var africa = ellipse(x, y, 0.52, 0.54, 0.1, 0.18);
    var asia = ellipse(x, y, 0.66, 0.36, 0.19, 0.13) || ellipse(x, y, 0.78, 0.42, 0.12, 0.1);
    var australia = ellipse(x, y, 0.82, 0.69, 0.075, 0.065);
    return northAmerica || southAmerica || europe || africa || asia || australia;
  }

  var marketNodes = [
    [0.2, 0.38], [0.44, 0.33], [0.51, 0.36], [0.6, 0.48],
    [0.73, 0.51], [0.78, 0.45], [0.84, 0.43], [0.84, 0.68]
  ];
  var marketLinks = [[0, 1], [0, 4], [1, 2], [1, 4], [2, 3], [3, 4], [4, 5], [5, 6], [5, 7], [6, 7]];
  var marketLabels = ['NYSE', 'NASDAQ', 'EUR/USD', 'S&P 500', 'FTSE', 'DAX', 'USD/JPY', 'NIKKEI'];
  var marketValues = ['+0.42%', '+0.18%', '1.1682', '+0.31%', '-0.12%', '+0.09%', '146.72', '+0.27%'];

  function bezierPoint(a, b, progress, width, height) {
    var x0 = a[0] * width;
    var y0 = a[1] * height;
    var x2 = b[0] * width;
    var y2 = b[1] * height;
    var x1 = (x0 + x2) * 0.5;
    var y1 = Math.min(y0, y2) - Math.abs(x2 - x0) * 0.12;
    var inverse = 1 - progress;
    return [inverse * inverse * x0 + 2 * inverse * progress * x1 + progress * progress * x2,
      inverse * inverse * y0 + 2 * inverse * progress * y1 + progress * progress * y2];
  }

  function renderGlobal(instance, time) {
    var ctx = instance.context;
    var width = instance.width;
    var height = instance.height;
    var speedTime = reduced.matches ? time * 0.3 : time;
    ctx.clearRect(0, 0, width, height);

    var spacing = compact.matches ? 15 : 11;
    var mapTop = height * 0.12;
    var mapHeight = height * 0.76;
    ctx.fillStyle = 'rgba(126,184,222,0.18)';
    for (var py = 0; py <= mapHeight; py += spacing) {
      for (var px = 0; px <= width; px += spacing) {
        if (isLand(px / width, py / mapHeight)) {
          ctx.beginPath();
          ctx.arc(px, mapTop + py, compact.matches ? 0.65 : 0.85, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.lineWidth = 0.8;
    for (var linkIndex = 0; linkIndex < marketLinks.length; linkIndex += 1) {
      if (compact.matches && linkIndex % 2) continue;
      var link = marketLinks[linkIndex];
      var start = marketNodes[link[0]];
      var end = marketNodes[link[1]];
      var startX = start[0] * width;
      var startY = mapTop + start[1] * mapHeight;
      var endX = end[0] * width;
      var endY = mapTop + end[1] * mapHeight;
      var controlX = (startX + endX) * 0.5;
      var controlY = Math.min(startY, endY) - Math.abs(endX - startX) * 0.12;
      ctx.strokeStyle = 'rgba(92,159,214,0.27)';
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(controlX, controlY, endX, endY);
      ctx.stroke();

      var progress = (speedTime * (0.000035 + linkIndex * 0.000002) + linkIndex * 0.17) % 1;
      var point = bezierPoint(start, end, progress, width, mapHeight);
      ctx.fillStyle = 'rgba(180,214,235,0.62)';
      ctx.beginPath();
      ctx.arc(point[0], mapTop + point[1], 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    for (var nodeIndex = 0; nodeIndex < marketNodes.length; nodeIndex += 1) {
      if (compact.matches && nodeIndex > 4) continue;
      var node = marketNodes[nodeIndex];
      var pulse = 1.5 + Math.sin(speedTime * 0.0012 + nodeIndex) * 0.55;
      ctx.strokeStyle = 'rgba(126,184,222,0.5)';
      ctx.fillStyle = 'rgba(205,228,242,0.7)';
      ctx.beginPath();
      ctx.arc(node[0] * width, mapTop + node[1] * mapHeight, pulse + 2.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(node[0] * width, mapTop + node[1] * mapHeight, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!compact.matches) {
      ctx.font = '10px ProximaNova, Arial, sans-serif';
      for (var labelIndex = 0; labelIndex < marketLabels.length; labelIndex += 1) {
        var labelNode = marketNodes[labelIndex];
        ctx.fillStyle = 'rgba(210,226,238,0.11)';
        ctx.fillText(marketLabels[labelIndex] + '  ' + marketValues[labelIndex], labelNode[0] * width + 12, mapTop + labelNode[1] * mapHeight - 9);
      }
    }

    var edgeFade = ctx.createLinearGradient(0, 0, 0, height);
    edgeFade.addColorStop(0, 'rgba(9,14,21,0.76)');
    edgeFade.addColorStop(0.22, 'rgba(9,14,21,0.04)');
    edgeFade.addColorStop(0.78, 'rgba(9,14,21,0.04)');
    edgeFade.addColorStop(1, 'rgba(9,14,21,0.56)');
    ctx.fillStyle = edgeFade;
    ctx.fillRect(0, 0, width, height);
  }

  function renderCapitalAndGrid(instance, time) {
    var ctx = instance.context;
    var width = instance.width;
    var height = instance.height;
    var sectionTop = instance.section.getBoundingClientRect().top;
    var pricingHeading = Array.from(instance.section.querySelectorAll('h3')).find(function (heading) {
      return heading.textContent.indexOf('Pricing for Any Trading Style') !== -1;
    });
    var pricingStart = pricingHeading ? pricingHeading.getBoundingClientRect().top - sectionTop - 100 : height * 0.52;
    var speedTime = reduced.matches ? time * 0.28 : time;
    ctx.clearRect(0, 0, width, height);

    var lineCount = compact.matches ? 11 : 19;
    for (var line = 0; line < lineCount; line += 1) {
      var baseY = 70 + line * Math.max(24, pricingStart / lineCount);
      var speedClass = line % 20 === 0 ? 0.00013 : line % 7 === 0 ? 0.000075 : 0.000038;
      var offset = (speedTime * speedClass * width + line * 83) % (width * 0.35);
      ctx.strokeStyle = 'rgba(92,159,214,' + (0.085 + (line % 5) * 0.013) + ')';
      ctx.lineWidth = line % 6 === 0 ? 1 : 0.65;
      ctx.beginPath();
      for (var x = -width * 0.2; x <= width * 1.1; x += 28) {
        var y = baseY + Math.sin(x * 0.007 + line * 0.72 + speedTime * 0.00012) * (7 + line % 4 * 3);
        y += Math.sin(x * 0.002 - speedTime * 0.000045) * 12;
        if (x === -width * 0.2) ctx.moveTo(x + offset, y);
        else ctx.lineTo(x + offset, y);
      }
      ctx.stroke();

      if (line % 3 === 0) {
        var particleX = (speedTime * (0.035 + line * 0.001) + line * 97) % width;
        var particleY = baseY + Math.sin(particleX * 0.007 + line * 0.72 + speedTime * 0.00012) * 10;
        ctx.fillStyle = 'rgba(169,205,227,0.38)';
        ctx.beginPath();
        ctx.arc(particleX, particleY, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    var transitionTop = Math.max(0, pricingStart - 120);
    var gridSpacingX = compact.matches ? 46 : 64;
    var gridSpacingY = compact.matches ? 42 : 52;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, transitionTop, width, height - transitionTop);
    ctx.clip();
    ctx.strokeStyle = 'rgba(126,184,222,0.09)';
    ctx.lineWidth = 0.7;
    for (var gx = 0; gx <= width; gx += gridSpacingX) {
      ctx.beginPath();
      ctx.moveTo(gx + 0.5, transitionTop);
      ctx.lineTo(gx + 0.5, height);
      ctx.stroke();
    }
    for (var gy = transitionTop; gy <= height; gy += gridSpacingY) {
      ctx.beginPath();
      ctx.moveTo(0, gy + 0.5);
      ctx.lineTo(width, gy + 0.5);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(92,159,214,0.24)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var curveX = 0; curveX <= width; curveX += 18) {
      var normalized = curveX / width;
      var curveY = transitionTop + (height - transitionTop) * (0.48 + Math.sin(normalized * 8 + speedTime * 0.00008) * 0.11 + Math.sin(normalized * 19 - speedTime * 0.000035) * 0.035);
      if (curveX === 0) ctx.moveTo(curveX, curveY);
      else ctx.lineTo(curveX, curveY);
    }
    ctx.stroke();

    if (!compact.matches) {
      var coordinates = ['04:32:18', 'NYSE', '102.42', '+0.82%', '1.1682', 'NASDAQ', '06:41:02'];
      ctx.font = '9px ProximaNova, Arial, sans-serif';
      for (var coordinate = 0; coordinate < coordinates.length; coordinate += 1) {
        ctx.fillStyle = 'rgba(218,230,239,0.09)';
        ctx.fillText(coordinates[coordinate], 24 + (coordinate % 4) * width * 0.24, transitionTop + 42 + Math.floor(coordinate / 4) * 85);
      }
    }
    ctx.restore();

    var fade = ctx.createLinearGradient(0, transitionTop - 100, 0, transitionTop + 140);
    fade.addColorStop(0, 'rgba(8,11,16,0)');
    fade.addColorStop(0.5, 'rgba(9,14,21,0.06)');
    fade.addColorStop(1, 'rgba(9,14,21,0.14)');
    ctx.fillStyle = fade;
    ctx.fillRect(0, Math.max(0, transitionTop - 100), width, 240);
  }

  function renderTools(instance, time) {
    var ctx = instance.context;
    var width = instance.width;
    var height = instance.height;
    var speedTime = reduced.matches ? time * 0.2 : time;
    ctx.clearRect(0, 0, width, height);

    var columnGap = compact.matches ? 54 : 82;
    var rowGap = compact.matches ? 48 : 66;
    ctx.strokeStyle = 'rgba(126,184,222,0.055)';
    ctx.lineWidth = 0.7;
    for (var column = -1; column <= width / columnGap + 1; column += 1) {
      var columnX = column * columnGap + (speedTime * 0.0025 % columnGap);
      ctx.beginPath();
      ctx.moveTo(columnX, 0);
      ctx.lineTo(columnX, height);
      ctx.stroke();
    }
    for (var row = 0; row <= height / rowGap; row += 1) {
      ctx.beginPath();
      ctx.moveTo(0, row * rowGap + 0.5);
      ctx.lineTo(width, row * rowGap + 0.5);
      ctx.stroke();
    }

    var modules = compact.matches ? 5 : 9;
    for (var moduleIndex = 0; moduleIndex < modules; moduleIndex += 1) {
      var moduleX = ((moduleIndex * 0.193 + 0.08) % 0.92) * width;
      var moduleY = (0.13 + (moduleIndex * 0.271 % 0.72)) * height;
      var active = 0.38 + Math.sin(speedTime * 0.00065 + moduleIndex * 1.7) * 0.18;
      ctx.strokeStyle = 'rgba(92,159,214,' + active * 0.35 + ')';
      ctx.fillStyle = 'rgba(184,211,229,' + active + ')';
      ctx.strokeRect(moduleX - 10, moduleY - 10, 20, 20);
      ctx.fillRect(moduleX - 1.2, moduleY - 1.2, 2.4, 2.4);
    }

    var scanY = (speedTime * 0.012) % (height + 180) - 90;
    var scan = ctx.createLinearGradient(0, scanY - 70, 0, scanY + 70);
    scan.addColorStop(0, 'rgba(92,159,214,0)');
    scan.addColorStop(0.5, 'rgba(92,159,214,0.055)');
    scan.addColorStop(1, 'rgba(92,159,214,0)');
    ctx.fillStyle = scan;
    ctx.fillRect(0, scanY - 70, width, 140);

    var vignette = ctx.createRadialGradient(width * 0.5, height * 0.38, 20, width * 0.5, height * 0.38, width * 0.65);
    vignette.addColorStop(0, 'rgba(10,15,22,0)');
    vignette.addColorStop(1, 'rgba(10,15,22,0.68)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
  }

  createCanvas(globalSection, 'ymc-global-canvas', renderGlobal);
  createCanvas(capitalSection, 'ymc-capital-grid-canvas', renderCapitalAndGrid);
  createCanvas(toolsSection, 'ymc-tools-canvas', renderTools);

  var running = true;
  function animate(time) {
    if (!running) return;
    for (var index = 0; index < instances.length; index += 1) {
      var instance = instances[index];
      var targetInterval = compact.matches ? 33 : 16;
      if (instance.visible && time - instance.lastFrame >= targetInterval) {
        instance.renderer(instance, time, false);
        instance.lastFrame = time;
      }
    }
    requestAnimationFrame(animate);
  }

  var visibilityObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var instance = instances.find(function (candidate) { return candidate.section === entry.target; });
      if (instance) instance.visible = entry.isIntersecting;
    });
  }, { rootMargin: '200px 0px' });
  instances.forEach(function (instance) { visibilityObserver.observe(instance.section); });

  function handleViewportChange() {
    instances.forEach(function (instance) { instance.resize(); });
  }
  compact.addEventListener('change', handleViewportChange);
  reduced.addEventListener('change', handleViewportChange);

  window.addEventListener('pagehide', function () {
    running = false;
    visibilityObserver.disconnect();
    instances.forEach(function (instance) { instance.observer.disconnect(); });
    compact.removeEventListener('change', handleViewportChange);
    reduced.removeEventListener('change', handleViewportChange);
  }, { once: true });

  requestAnimationFrame(animate);
})();
