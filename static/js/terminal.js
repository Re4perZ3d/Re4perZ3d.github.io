// Re4perZ3d interactive footer terminal
(function () {
  var form = document.getElementById("term");
  var input = document.getElementById("term-in");
  var out = document.getElementById("term-out");
  var dataEl = document.getElementById("term-data");
  if (!form || !input || !out || !dataEl) return;

  var data = { pages: [] };
  try { data = JSON.parse(dataEl.textContent); } catch (e) {}

  var dirs = ["whoami", "writeups", "articles", "projects", "certs", "cheatsheets", "tags"];
  var sections = ["stats", "certs", "ctf", "projects", "latest"];
  var history = [], hIndex = 0;

  function print(text, cls) {
    var line = document.createElement("div");
    if (cls) line.className = cls;
    line.textContent = text;
    out.appendChild(line);
    out.scrollTop = out.scrollHeight;
  }
  function go(url) { if (url) window.location.href = url; }
  function ext(url, label) {
    if (!url) { print(label + ": not configured yet"); return; }
    print("opening " + label + "..."); window.open(url, "_blank", "noopener");
  }
  function base(p) { return "/" + p.replace(/^~?\/?/, "").replace(/\/$/, "") + "/"; }

  var commands = {
    help: function () {
      print([
        "commands:",
        "  whoami · neofetch     who is behind this site",
        "  ls [dir] · cd <dir>   list / open a section",
        "  cat <name>            open a post by name",
        "  open <section>        jump here (ctf, projects, certs, stats)",
        "  ctf · certs           jump to that section",
        "  matrix                enter the matrix",
        "  social · resume       links",
        "  banner · date · history · clear"
      ].join("\n"));
    },
    whoami: function () { go(base("whoami")); },
    neofetch: function () {
      print([
        "        ▄▄▄        reaper@re4perz3d",
        "      ▄█████▄      ----------------",
        "     ███▀ ▀███     role     SOC Analyst // Purple -> Red",
        "     ███   ███     employer Raise Guard",
        "     ▀███▄███▀     study    TEK-UP (eng., grad 2028)",
        "       ▀█▀         certs    CRTP · eCPPT · eJPT · CTI",
        "                   htb      Prodigy · lvl 78 · 41 machines",
        "                   team     no!dea",
        "                   shell    type 'help'"
      ].join("\n"));
    },
    ls: function (a) {
      var dir = (a[0] || "").replace(/^~?\/?/, "").replace(/\/$/, "");
      if (!dir) { print(dirs.map(function (d) { return d + "/"; }).join("  ")); return; }
      if (dirs.indexOf(dir) === -1) { print("ls: cannot access '" + dir + "'", "err"); return; }
      var items = data.pages.filter(function (p) { return p.section === dir; });
      print(items.length ? items.map(function (p) { return "  " + p.title; }).join("\n") : "(empty)");
    },
    cd: function (a) {
      var dir = (a[0] || "").replace(/^~?\/?/, "").replace(/\/$/, "");
      if (!dir || dir === "~" || dir === "..") { go("/"); return; }
      if (dirs.indexOf(dir) === -1) { print("cd: " + dir + ": No such file or directory", "err"); return; }
      go(base(dir));
    },
    cat: function (a) {
      var q = a.join(" ").toLowerCase().replace(/\.md$/, "");
      if (!q) { print("usage: cat <name>"); return; }
      var hit = data.pages.filter(function (p) { return p.title.toLowerCase().indexOf(q) > -1 || p.url.toLowerCase().indexOf(q) > -1; })[0];
      if (hit) go(hit.url); else print("cat: " + q + ": No such file", "err");
    },
    open: function (a) {
      var s = (a[0] || "").replace(/^#/, "");
      var el = s && document.getElementById(s);
      if (el) { el.scrollIntoView({ behavior: "smooth" }); print("-> " + s); }
      else if (dirs.indexOf(s) > -1) go(base(s));
      else print("open: unknown section '" + s + "' (try: " + sections.join(", ") + ")", "err");
    },
    ctf: function () { commands.open(["ctf"]); },
    certs: function () { commands.open(["certs"]); },
    projects: function () { commands.open(["projects"]); },
    matrix: function () {
      print("Wake up, Neo... the matrix has you.");
      if (window.__matrixBurst) window.__matrixBurst();
      else print("(reduced-motion is on -- matrix stays calm)");
    },
    social: function () {
      print("github    " + (data.github || "-"));
      print("linkedin  " + (data.linkedin || "-"));
      print("htb       " + (data.htb || "-"));
      print("email     " + (data.email || "-"));
    },
    resume: function () { go(data.resume); },
    github: function () { ext(data.github, "github"); },
    linkedin: function () { ext(data.linkedin, "linkedin"); },
    htb: function () { ext(data.htb, "hackthebox"); },
    banner: function () {
      print([
        "    ____       __ __                 _____  _____     __",
        "   / __ \\___  / // / ____  ___  ____/__  / |__  /____/ /",
        "  / /_/ / _ \\/ // /_/ __ \\/ _ \\/ ___/ / /   /_ </ __  /",
        " / _, _/  __/__  __/ /_/ /  __/ /    / /_____/ / /_/ /",
        "/_/ |_|\\___/  /_/ / .___/\\___/_/    /____/____/\\__,_/",
        "                 /_/"
      ].join("\n"));
    },
    history: function () { print(history.map(function (c, i) { return String(i + 1).padStart(4) + "  " + c; }).join("\n")); },
    clear: function () { out.textContent = ""; },
    sudo: function () { print("reaper is not in the sudoers file. This incident will be reported to the SOC."); },
    exit: function () { print("there is no escape. try 'help'."); },
    date: function () { print(new Date().toString()); },
    echo: function (a) { print(a.join(" ")); }
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var raw = input.value.trim();
    input.value = "";
    if (!raw) return;
    history.push(raw); hIndex = history.length;
    print("$ " + raw, "echo");
    if (/^rm\s+-rf\s+\/?\*?$/.test(raw)) { print("nice try. EDR blocked the process and isolated the host."); return; }
    var parts = raw.split(/\s+/), cmd = parts[0].toLowerCase(), args = parts.slice(1);
    var fn = commands[cmd];
    if (fn) fn(args); else print(cmd + ": command not found. try 'help'", "err");
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowUp" && history.length) {
      e.preventDefault(); hIndex = Math.max(0, hIndex - 1); input.value = history[hIndex];
    } else if (e.key === "ArrowDown" && history.length) {
      e.preventDefault(); hIndex = Math.min(history.length, hIndex + 1); input.value = history[hIndex] || "";
    } else if (e.key === "Tab" && input.value) {
      e.preventDefault();
      var p = input.value.split(/\s+/), last = p[p.length - 1];
      var pool = p.length === 1 ? Object.keys(commands) : dirs.concat(sections);
      var m = pool.filter(function (x) { return x.indexOf(last) === 0; });
      if (m.length === 1) { p[p.length - 1] = m[0]; input.value = p.join(" ") + (p.length === 1 ? " " : ""); }
      else if (m.length > 1) print(m.join("  "));
    }
  });

  document.querySelectorAll("[data-term-run]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      input.value = btn.getAttribute("data-term-run");
      if (form.requestSubmit) form.requestSubmit();
      else form.dispatchEvent(new Event("submit", { cancelable: true }));
      input.focus();
    });
  });
})();
