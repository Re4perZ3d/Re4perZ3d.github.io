// Click-to-enlarge lightbox for the CTF gallery.
(function () {
  var wrap = document.querySelector("[data-lightbox]");
  var lb = document.getElementById("lightbox");
  if (!wrap || !lb) return;
  var img = lb.querySelector(".lb-img");
  var links = Array.prototype.slice.call(wrap.querySelectorAll("a[data-full]"));
  var idx = 0;

  function open(i) {
    idx = (i + links.length) % links.length;
    var a = links[idx];
    img.src = a.getAttribute("href");
    img.alt = a.querySelector("img") ? a.querySelector("img").alt : "";
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    lb.querySelector(".lb-close").focus();
  }
  function close() { lb.hidden = true; document.body.style.overflow = ""; }

  links.forEach(function (a, i) {
    a.addEventListener("click", function (e) { e.preventDefault(); open(i); });
  });
  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.querySelector(".lb-next").addEventListener("click", function () { open(idx + 1); });
  lb.querySelector(".lb-prev").addEventListener("click", function () { open(idx - 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") open(idx + 1);
    else if (e.key === "ArrowLeft") open(idx - 1);
  });
})();
