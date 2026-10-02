// Small "hacker" touches: glitch flicker on the banner, decrypt-reveal on
// section headings, and a mouse-parallax tilt on the hero emblem.
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  // ---- periodic glitch flicker on the big banner ----
  var banner = document.querySelector(".banner");
  if (banner) {
    (function loop() {
      var delay = 4000 + Math.random() * 6000;
      setTimeout(function () {
        banner.classList.add("glitch");
        setTimeout(function () { banner.classList.remove("glitch"); }, 220);
        loop();
      }, delay);
    })();
  }

  // ---- decrypt-reveal on section headings ----
  var chars = "!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  function decrypt(el) {
    if (el.dataset.decrypted) return;
    el.dataset.decrypted = "1";
    var final = el.textContent;
    var len = final.length, frame = 0, totalFrames = 14;
    var reveal = 0;
    var iv = setInterval(function () {
      var out = "";
      reveal = Math.floor((frame / totalFrames) * len);
      for (var i = 0; i < len; i++) {
        if (i < reveal) out += final[i];
        else if (final[i] === " ") out += " ";
        else out += chars[(Math.random() * chars.length) | 0];
      }
      el.textContent = out;
      frame++;
      if (frame > totalFrames) { el.textContent = final; clearInterval(iv); }
    }, 28);
  }
  var heads = document.querySelectorAll(".band h2, .band p.cmd");
  if (heads.length && "IntersectionObserver" in window) {
    var hio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { decrypt(e.target); hio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    heads.forEach(function (h) { hio.observe(h); });
  }

  // ---- mouse-parallax tilt on hero emblem ----
  var emblem = document.querySelector(".emblem");
  if (emblem) {
    var hero = document.querySelector(".hero-right") || emblem.parentElement;
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      emblem.style.transform = "rotateY(" + (px * 10) + "deg) rotateX(" + (py * -10) + "deg)";
    });
    hero.addEventListener("mouseleave", function () { emblem.style.transform = ""; });
  }
})();
