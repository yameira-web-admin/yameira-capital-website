(function () {
  'use strict';

  var hero = document.querySelector('#contents > .hero');
  if (!hero) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'financial-data-background';
  canvas.setAttribute('aria-hidden', 'true');
  hero.classList.add('financial-data-region');
  hero.prepend(canvas);

  var context = canvas.getContext('2d', { alpha: false, desynchronized: true });
  if (!context) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var compact = window.matchMedia('(max-width: 767px)');
  var particleCount = compact.matches ? 24 : 58;
  var particles = [];
  var width = 1;
  var height = 1;
  var pixelRatio = 1;
  var startTime = performance.now();
  var running = true;
  var visible = true;
  var mouseX = 0;
  var mouseY = 0;
  var targetMouseX = 0;
  var targetMouseY = 0;

  function randomParticle(index) {
    return {
      seed: index * 1.618 + Math.random() * 10,
      x: Math.random(),
      y: 0.08 + Math.random() * 0.84,
      speed: 0.000036 + Math.random() * 0.00005,
      radius: 0.45 + Math.random() * 1.05,
      alpha: 0.08 + Math.random() * 0.18,
      curve: index % 3
    };
  }

  function resetParticles() {
    particles.length = 0;
    particleCount = compact.matches ? 24 : (reducedMotion.matches ? 34 : 58);
    for (var index = 0; index < particleCount; index += 1) {
      particles.push(randomParticle(index));
    }
  }

  function resize() {
    var bounds = hero.getBoundingClientRect();
    width = Math.max(1, Math.round(bounds.width));
    height = Math.max(1, Math.round(bounds.height));
    pixelRatio = Math.min(window.devicePixelRatio || 1, compact.matches ? 1.35 : 1.8);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    draw(performance.now(), true);
  }

  function curveY(curveIndex, normalizedX, time) {
    var base = [0.29, 0.51, 0.72][curveIndex];
    var amplitude = [0.082, 0.108, 0.068][curveIndex];
    var primary = Math.sin(normalizedX * 5.1 + time * (0.000095 + curveIndex * 0.000014) + curveIndex * 1.7);
    var secondary = Math.sin(normalizedX * 11.4 - time * 0.000044 + curveIndex * 0.8) * 0.36;
    var trend = (normalizedX - 0.5) * [0.15, -0.055, 0.09][curveIndex];
    return (base + amplitude * (primary + secondary) - trend) * height;
  }

  function drawGrid() {
    context.save();
    context.lineWidth = 1;
    context.strokeStyle = 'rgba(92, 159, 214, 0.055)';
    var horizon = height * 0.4;
    var gridStart = -width * 0.04;
    var verticals = compact.matches ? 7 : 12;
    var rows = compact.matches ? 9 : 14;

    for (var column = 0; column <= verticals; column += 1) {
      var ratio = column / verticals;
      var topX = gridStart + ratio * (width - gridStart);
      var bottomX = -width * 0.12 + ratio * width * 1.24;
      context.beginPath();
      context.moveTo(topX + mouseX * 3, horizon);
      context.lineTo(bottomX + mouseX * 8, height);
      context.stroke();
    }

    for (var row = 0; row <= rows; row += 1) {
      var depth = row / rows;
      var eased = depth * depth;
      var y = horizon + eased * (height - horizon);
      context.globalAlpha = 0.35 + depth * 0.65;
      context.beginPath();
      context.moveTo(gridStart - depth * width * 0.08, y + mouseY * 4);
      context.lineTo(width, y + mouseY * 4);
      context.stroke();
    }
    context.restore();
  }

  function drawCurves(time) {
    var colors = ['rgba(92,159,214,0.46)', 'rgba(95,175,143,0.32)', 'rgba(201,168,106,0.28)'];
    var startX = -width * 0.06;
    var span = width * 1.12;
    var segments = compact.matches ? 54 : 88;

    for (var curve = 0; curve < 3; curve += 1) {
      context.save();
      context.lineWidth = curve === 0 ? 1.4 : 1;
      context.strokeStyle = colors[curve];
      context.shadowColor = colors[curve];
      context.shadowBlur = curve === 0 ? 8 : 4;
      context.beginPath();
      for (var point = 0; point <= segments; point += 1) {
        var normalized = point / segments;
        var x = startX + normalized * span + mouseX * (5 + curve * 2);
        var y = curveY(curve, normalized, time) + mouseY * (4 + curve);
        if (point === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
      context.restore();

      for (var node = 1; node <= 3; node += 1) {
        var nodePosition = (node * 0.23 + curve * 0.11 + (time * 0.000014 * (curve + 1))) % 0.92;
        var nodeX = startX + nodePosition * span;
        var nodeY = curveY(curve, nodePosition, time);
        var pulse = 0.72 + Math.sin(time * 0.002 + node * 2.2 + curve) * 0.28;
        context.beginPath();
        context.fillStyle = curve === 2 ? 'rgba(201,168,106,' + pulse * 0.55 + ')' : 'rgba(126,184,222,' + pulse * 0.62 + ')';
        context.arc(nodeX, nodeY, 1.5 + pulse, 0, Math.PI * 2);
        context.fill();
      }
    }
  }

  function drawParticles(time) {
    for (var index = 0; index < particles.length; index += 1) {
      var particle = particles[index];
      var progress = (particle.x + time * particle.speed) % 1.05;
      var x = width * (-0.04 + progress * 1.1) + mouseX * 7;
      var normalized = Math.min(1, Math.max(0, (x + width * 0.06) / (width * 1.12)));
      var curve = curveY(particle.curve, normalized, time);
      var drift = Math.sin(time * 0.00032 + particle.seed) * height * 0.045;
      var y = curve + drift + (particle.y - 0.5) * height * 0.24;
      context.beginPath();
      context.fillStyle = 'rgba(151,190,215,' + particle.alpha + ')';
      context.arc(x, y, particle.radius, 0, Math.PI * 2);
      context.fill();
    }
  }

  function drawVignette() {
    var cleanArea = context.createLinearGradient(0, 0, width, 0);
    cleanArea.addColorStop(0, 'rgba(8,11,16,0.28)');
    cleanArea.addColorStop(0.5, 'rgba(8,11,16,0.08)');
    cleanArea.addColorStop(1, 'rgba(8,11,16,0.2)');
    context.fillStyle = cleanArea;
    context.fillRect(0, 0, width, height);

    var vertical = context.createLinearGradient(0, 0, 0, height);
    vertical.addColorStop(0, 'rgba(8,11,16,0.42)');
    vertical.addColorStop(0.5, 'rgba(8,11,16,0)');
    vertical.addColorStop(1, 'rgba(8,11,16,0.55)');
    context.fillStyle = vertical;
    context.fillRect(0, 0, width, height);
  }

  function draw(time, forceStatic) {
    var renderTime = reducedMotion.matches
      ? startTime + (time - startTime) * 0.65
      : time;
    context.fillStyle = '#080b10';
    context.fillRect(0, 0, width, height);
    mouseX += (targetMouseX - mouseX) * 0.025;
    mouseY += (targetMouseY - mouseY) * 0.025;
    drawGrid();
    drawCurves(forceStatic ? startTime : renderTime);
    drawParticles(forceStatic ? startTime : renderTime);
    drawVignette();
  }

  function animate(time) {
    if (!running) return;
    if (visible) {
      draw(time, false);
    }
    requestAnimationFrame(animate);
  }

  function onPointerMove(event) {
    targetMouseX = (event.clientX / Math.max(1, window.innerWidth) - 0.5) * 0.7;
    targetMouseY = (event.clientY / Math.max(1, window.innerHeight) - 0.5) * 0.5;
  }

  function onVisibilityChange() {
    visible = !document.hidden;
  }

  function onCompactChange() {
    resetParticles();
    resize();
  }

  function onMotionChange() {
    resetParticles();
    draw(performance.now(), false);
  }

  function destroy() {
    running = false;
    resizeObserver.disconnect();
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('pointermove', onPointerMove);
    reducedMotion.removeEventListener('change', onMotionChange);
    compact.removeEventListener('change', onCompactChange);
  }

  resetParticles();
  var resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(hero);
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  reducedMotion.addEventListener('change', onMotionChange);
  compact.addEventListener('change', onCompactChange);
  window.addEventListener('pagehide', destroy, { once: true });
  resize();
  requestAnimationFrame(animate);
})();
