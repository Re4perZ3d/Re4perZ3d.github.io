// Hero boot + typing sequence, stat counters, reveal-on-scroll
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- reveal sections once ----
  var reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("shown"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("shown"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  // ---- stat counters ----
  function runCounters() {
    document.querySelectorAll("[data-count] dd").forEach(function (dd) {
      var m = /^(\d+)$/.exec(dd.textContent.trim());
      if (!m) return;
      var target = parseInt(m[1], 10), start = null, dur = 900;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        dd.textContent = Math.round(p * target).toString();
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  var statsEl = document.querySelector("[data-count]");
  if (statsEl && !reduce && "IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCounters(); so.disconnect(); } });
    }, { threshold: 0.4 });
    so.observe(statsEl);
  }

  // ---- hero typing sequence ----
  var seq = document.querySelector("[data-seq]");
  if (!seq) return;
  var steps = Array.prototype.slice.call(seq.querySelectorAll(".seq-step"));
  var boot = document.querySelector(".boot");

  if (reduce) { steps.forEach(function (s) { s.classList.add("done"); }); return; }

  // hide until typed
  seq.classList.add("armed");
  var bootLines = [
    "[  OK  ] loading re4perz3d profile...",
    "[  OK  ] mounting /soc /red /purple",
    "[  OK  ] session ready"
  ];

  function typeInto(el, text, speed, done) {
    var i = 0;
    (function tick() {
      el.textContent = text.slice(0, i++);
      if (i <= text.length) setTimeout(tick, speed);
      else if (done) done();
    })();
  }

  function typeBoot(idx, done) {
    if (!boot || idx >= bootLines.length) { if (done) done(); return; }
    var line = document.createElement("div");
    boot.appendChild(line);
    typeInto(line, bootLines[idx], 12, function () { setTimeout(function () { typeBoot(idx + 1, done); }, 90); });
  }

  function runStep(idx) {
    if (idx >= steps.length) return;
    var step = steps[idx];
    var cmd = step.getAttribute("data-cmd");
    var typed = step.querySelector(".typed");
    step.classList.add("active");
    typeInto(typed, cmd, 42, function () {
      setTimeout(function () {
        step.classList.add("done");
        setTimeout(function () { runStep(idx + 1); }, 260);
      }, 180);
    });
  }

  typeBoot(0, function () {
    if (boot) setTimeout(function () { boot.classList.add("fade"); }, 500);
    runStep(0);
  });
})();
