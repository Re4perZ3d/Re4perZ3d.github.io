// Re4perZ3d interactive footer terminal
(function () {
  const form = document.getElementById("term");
  const input = document.getElementById("term-in");
  const out = document.getElementById("term-out");
  const dataEl = document.getElementById("term-data");
  if (!form || !input || !out || !dataEl) return;

  let data = { pages: [] };
  try { data = JSON.parse(dataEl.textContent); } catch (e) { /* keep defaults */ }

  const dirs = ["whoami", "writeups", "research", "projects", "certs", "cheatsheets", "tags"];
  const history = [];
  let hIndex = 0;

  function print(text, cls) {
    const line = document.createElement("div");
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
  function base(path) { return "/" + path.replace(/^~?\/?/, "").replace(/\/$/, "") + "/"; }

  const commands = {
    help() {
      print([
        "available commands:",
        "  whoami            who is behind this site",
        "  ls [dir]          list directories or posts",
        "  cd <dir>          open a section (writeups, research, projects...)",
        "  cat <name>        open a post by (part of) its name",
        "  resume            open my resume",
        "  github | linkedin | htb",
        "  history | clear"
      ].join("\n"));
    },
    whoami() { go(base("whoami")); },
    ls(args) {
      const dir = (args[0] || "").replace(/^~?\/?/, "").replace(/\/$/, "");
      if (!dir) { print(dirs.map(d => d + "/").join("  ")); return; }
      const items = data.pages.filter(p => p.section === dir);
      if (!dirs.includes(dir)) { print("ls: cannot access '" + dir + "': No such file or directory", "err"); return; }
      print(items.length ? items.map(p => "  " + p.title).join("\n") : "(empty)");
    },
    cd(args) {
      const dir = (args[0] || "").replace(/^~?\/?/, "").replace(/\/$/, "");
      if (!dir || dir === "~" || dir === "..") { go("/"); return; }
      if (!dirs.includes(dir)) { print("cd: " + dir + ": No such file or directory", "err"); return; }
      go(base(dir));
    },
    cat(args) {
      const q = args.join(" ").toLowerCase().replace(/\.md$/, "");
      if (!q) { print("usage: cat <name>"); return; }
      const hit = data.pages.find(p => p.title.toLowerCase().includes(q) || p.url.toLowerCase().includes(q));
      if (hit) go(hit.url); else print("cat: " + q + ": No such file", "err");
    },
    resume() { go(data.resume); },
    github() { ext(data.github, "github"); },
    linkedin() { ext(data.linkedin, "linkedin"); },
    htb() { ext(data.htb, "hackthebox"); },
    history() { print(history.map((c, i) => String(i + 1).padStart(4) + "  " + c).join("\n")); },
    clear() { out.textContent = ""; },
    sudo() { print("reaper is not in the sudoers file. This incident will be reported to the SOC."); },
    exit() { print("there is no escape. try 'help'."); },
    date() { print(new Date().toString()); },
    echo(args) { print(args.join(" ")); }
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const raw = input.value.trim();
    input.value = "";
    if (!raw) return;
    history.push(raw); hIndex = history.length;
    print("$ " + raw, "echo");
    if (/^rm\s+-rf\s+\/?\*?$/.test(raw)) { print("nice try. EDR blocked the process and isolated the host."); return; }
    const [cmd, ...args] = raw.split(/\s+/);
    const fn = commands[cmd.toLowerCase()];
    if (fn) fn(args); else print(cmd + ": command not found. try 'help'", "err");
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowUp" && history.length) {
      e.preventDefault(); hIndex = Math.max(0, hIndex - 1); input.value = history[hIndex];
    } else if (e.key === "ArrowDown" && history.length) {
      e.preventDefault(); hIndex = Math.min(history.length, hIndex + 1); input.value = history[hIndex] || "";
    } else if (e.key === "Tab" && input.value) {
      const parts = input.value.split(/\s+/);
      const last = parts[parts.length - 1];
      const pool = parts.length === 1 ? Object.keys(commands) : dirs;
      const match = pool.filter(x => x.startsWith(last));
      if (match.length === 1) { e.preventDefault(); parts[parts.length - 1] = match[0]; input.value = parts.join(" ") + (parts.length > 1 ? "" : " "); }
    }
  });
})();
