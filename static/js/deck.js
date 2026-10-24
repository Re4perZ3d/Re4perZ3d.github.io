/* ~/deck command deck — variable substitution, filtering, copy. No deps. */
(function () {
  "use strict";
  var deck = document.querySelector(".deck");
  if (!deck) return;

  var KEYS = ["IP", "DOMAIN", "DC", "USER", "PASS", "LHOST"];
  var STORE = "re4per-deck-vars";
  var vals = {};
  try { vals = JSON.parse(localStorage.getItem(STORE) || "{}") || {}; } catch (e) { vals = {}; }

  // ---- variable inputs ----
  KEYS.forEach(function (k) {
    var input = document.getElementById("deck-v-" + k);
    if (!input) return;
    if (vals[k]) input.value = vals[k];
    input.addEventListener("input", function () {
      vals[k] = input.value.trim();
      try { localStorage.setItem(STORE, JSON.stringify(vals)); } catch (e) {}
      renderAll();
    });
  });

  // ---- tokenize a command into text + variable spans ----
  var TOKEN = /\{\{([A-Z]+)\}\}/g;
  function fill(codeEl) {
    var raw = codeEl.getAttribute("data-cmd") || "";
    codeEl.textContent = "";
    var last = 0, m;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(raw)) !== null) {
      if (m.index > last) codeEl.appendChild(document.createTextNode(raw.slice(last, m.index)));
      var k = m[1];
      var span = document.createElement("span");
      span.className = "v k-" + k;
      var val = vals[k];
      if (val) { span.textContent = val; } else { span.textContent = k; span.className += " unset"; }
      codeEl.appendChild(span);
      last = m.index + m[0].length;
    }
    if (last < raw.length) codeEl.appendChild(document.createTextNode(raw.slice(last)));
  }
  // resolved text for copying (value if set, else {{KEY}} so a blank is obvious)
  function resolve(raw) {
    return raw.replace(TOKEN, function (_, k) { return vals[k] ? vals[k] : "{{" + k + "}}"; });
  }

  var codes = Array.prototype.slice.call(deck.querySelectorAll("code.cmd"));
  function renderAll() { codes.forEach(fill); }
  renderAll();

  // ---- copy ----
  function copyCard(card, btn) {
    var code = card.querySelector("code.cmd");
    if (!code) return;
    var text = resolve(code.getAttribute("data-cmd") || "");
    var done = function () {
      if (!btn) return;
      var old = btn.textContent; btn.textContent = "copied"; btn.classList.add("ok");
      setTimeout(function () { btn.textContent = old; btn.classList.remove("ok"); }, 1100);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(text); done(); });
    } else { fallback(text); done(); }
  }
  function fallback(text) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
    } catch (e) {}
  }
  deck.addEventListener("click", function (e) {
    var btn = e.target.closest(".copy-btn");
    if (btn) { copyCard(btn.closest(".cmd-card"), btn); return; }
    var code = e.target.closest("code.cmd");
    if (code) { copyCard(code.closest(".cmd-card"), code.closest(".cmd-card").querySelector(".copy-btn")); }
  });

  // ---- filtering: phase (single) + surfaces (multi) + search ----
  var phaseFilter = "all";
  var surfaces = {};
  var query = "";
  var phases = Array.prototype.slice.call(deck.querySelectorAll(".deck-phase"));

  function apply() {
    var total = 0;
    phases.forEach(function (ph) {
      var id = ph.getAttribute("data-phase");
      var phaseOK = phaseFilter === "all" || phaseFilter === id;
      var shown = 0;
      var cards = ph.querySelectorAll(".cmd-card");
      Array.prototype.forEach.call(cards, function (card) {
        var surf = card.getAttribute("data-surface") || "";
        var surfList = Object.keys(surfaces).filter(function (s) { return surfaces[s]; });
        var surfOK = surfList.length === 0 || surfList.indexOf(surf) !== -1;
        var txt = (card.getAttribute("data-text") || "").toLowerCase();
        var searchOK = !query || txt.indexOf(query) !== -1;
        var vis = phaseOK && surfOK && searchOK;
        card.hidden = !vis;
        if (vis) shown++;
      });
      ph.hidden = !phaseOK || shown === 0;
      var c = ph.querySelector(".ph-c"); if (c) c.textContent = shown;
      total += shown;
    });
    var foot = document.getElementById("deck-count"); if (foot) foot.textContent = total;
    var empty = document.getElementById("deck-empty"); if (empty) empty.hidden = total > 0;
  }

  // phase chips
  Array.prototype.forEach.call(deck.querySelectorAll(".chip.phase"), function (chip) {
    chip.addEventListener("click", function () {
      var id = chip.getAttribute("data-phase");
      if (phaseFilter === id) { phaseFilter = "all"; } else { phaseFilter = id; }
      Array.prototype.forEach.call(deck.querySelectorAll(".chip.phase"), function (c) {
        c.classList.toggle("on", c.getAttribute("data-phase") === phaseFilter);
      });
      apply();
      if (phaseFilter !== "all") {
        var ph = deck.querySelector('.deck-phase[data-phase="' + phaseFilter + '"]');
        if (ph) ph.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
  // surface chips
  Array.prototype.forEach.call(deck.querySelectorAll(".chip.surface"), function (chip) {
    chip.addEventListener("click", function () {
      var s = chip.getAttribute("data-surface");
      surfaces[s] = !surfaces[s];
      chip.classList.toggle("on", surfaces[s]);
      apply();
    });
  });
  // search
  var search = document.getElementById("deck-search-input");
  if (search) {
    search.addEventListener("input", function () { query = search.value.trim().toLowerCase(); apply(); });
  }

  // ---- tools catalog modal ----
  var toolsBtn = document.getElementById("deck-tools-btn");
  var modal = document.getElementById("deck-tools");
  if (toolsBtn && modal) {
    toolsBtn.addEventListener("click", function () { modal.classList.add("open"); });
    modal.addEventListener("click", function (e) { if (e.target === modal || e.target.closest(".deck-modal-close")) modal.classList.remove("open"); });
  }

  // ---- keyboard: / focus search, Esc clear/close ----
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && document.activeElement !== search && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
      e.preventDefault(); if (search) search.focus();
    } else if (e.key === "Escape") {
      if (modal && modal.classList.contains("open")) { modal.classList.remove("open"); return; }
      if (search && document.activeElement === search) { search.value = ""; query = ""; apply(); search.blur(); }
    }
  });

  apply();
})();
