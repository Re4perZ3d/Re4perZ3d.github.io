// Subtle matrix rain background, with a burst hook the terminal can call.
(function () {
  var canvas = document.getElementById("matrix");
  if (!canvas) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ctx = canvas.getContext("2d");
  var chars = "アイウエオカキクケコｱｲｳｴｵ0123456789ABCDEF<>[]{}#$%&*/\\|=+".split("");
  var font = 16, cols = 0, drops = [], w = 0, h = 0, boost = 0;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    cols = Math.floor(w / font);
    drops = new Array(cols).fill(0).map(function () { return Math.random() * -50; });
  }
  resize();
  window.addEventListener("resize", resize);

  function draw() {
    ctx.fillStyle = "rgba(10, 13, 18, 0.10)";
    ctx.fillRect(0, 0, w, h);
    ctx.font = font + "px 'JetBrains Mono', monospace";
    for (var i = 0; i < drops.length; i++) {
      var ch = chars[(Math.random() * chars.length) | 0];
      var x = i * font, y = drops[i] * font;
      var head = boost > 0 && Math.random() > 0.985;
      ctx.fillStyle = head ? "#c0f7d0" : (boost > 0 ? "rgba(158,206,106,0.55)" : "rgba(122,162,247,0.30)");
      ctx.fillText(ch, x, y);
      if (y > h && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 1;
    }
    if (boost > 0) boost--;
  }

  var timer = null;
  function start() { if (!timer && !reduce) timer = setInterval(draw, 66); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  // pause when tab hidden
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else start();
  });

  if (reduce) {
    // one static frame, very faint
    ctx.fillStyle = "rgba(10,13,18,1)"; ctx.fillRect(0, 0, w, h);
  } else {
    start();
  }

  // terminal hook: intensify the rain for a few seconds
  window.__matrixBurst = function () {
    if (reduce) return;
    canvas.classList.add("loud");
    boost = 240;
    start();
    setTimeout(function () { canvas.classList.remove("loud"); }, 6000);
  };
})();
