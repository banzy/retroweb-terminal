<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link
      rel="icon"
      href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='4' fill='%230a160a'/%3E%3Cpath fill='%2333ff66' d='M7 8h2v14H7V8zm4 0h2v10h-2V8zm4 3h2v14h-2V11zm4-3h2v8h-2V8zm4 5h2v12h-2V13z'/%3E%3C/svg%3E"
      type="image/svg+xml"
    />
    <title>Wake up Neo</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=IBM+Plex+Mono:wght@400;500;700&family=Space+Mono:wght@400;700&family=Nova+Mono&family=Azeret+Mono:wght@400;500;700&display=swap"
    />
    <style>
      :root {
        --startup-bg: #050b06;
      }

      html,
      body {
        margin: 0;
        min-height: 100%;
        background: var(--startup-bg);
      }

      #root {
        min-height: 100vh;
      }

      .startup-shell {
        position: fixed;
        inset: 0;
        display: none;
        align-items: stretch;
        justify-content: center;
        padding: clamp(16px, 4vw, 56px);
        box-sizing: border-box;
        background: var(--startup-cabinet-bg, transparent);
      }

      .startup-shell[data-cabinet="none"] {
        padding: 0;
        background: transparent;
      }

      .startup-shell[data-cabinet]:not([data-cabinet="none"]) {
        display: flex;
      }

      .startup-shell__screen {
        flex: 1;
        border-radius: 18px;
        overflow: hidden;
        position: relative;
        box-shadow:
          inset 0 0 60px rgba(0, 0, 0, 0.7),
          0 20px 60px rgba(0, 0, 0, 0.5);
        border: var(--startup-screen-border, 0 solid transparent);
        background: var(--startup-bg);
      }

      .startup-warning {
        display: none;
        position: absolute;
        inset: 0;
        padding: 24px;
        color: #33ff66;
        font: 16px/1.4 "IBM Plex Mono", "Courier New", monospace;
        white-space: pre-wrap;
      }

      .startup-shell[data-mode="file"] {
        display: flex;
      }

      .startup-shell[data-mode="file"] .startup-warning {
        display: block;
      }

      .startup-shell[data-cabinet="vt100"] {
        --startup-cabinet-bg: linear-gradient(180deg, #eee0bd 0%, #cfbf95 100%);
        --startup-screen-border: 18px solid #4a4033;
      }

      .startup-shell[data-cabinet="pet2001"] {
        --startup-cabinet-bg: linear-gradient(180deg, #e5e5de 0%, #aaa99f 100%);
        --startup-screen-border: 22px solid #343430;
      }

      .startup-shell[data-cabinet="apple3"] {
        --startup-cabinet-bg: linear-gradient(180deg, #fff8e7 0%, #ded5bf 100%);
        --startup-screen-border: 16px solid #575757;
      }
    </style>
    <script>
      (function () {
        try {
          var raw = window.localStorage.getItem("w1975.cabinet");
          var cabinet = raw ? JSON.parse(raw) : "vt100";
          var root = document.documentElement;
          root.style.setProperty("--startup-cabinet", cabinet || "vt100");
          if (cabinet && cabinet !== "none") {
            root.style.setProperty("--startup-bg", "#050b06");
          }
        } catch {}
      })();
    </script>
    <script type="module" crossorigin src="/wakeup/assets/index-DXOZDDzr.js"></script>
    <link rel="stylesheet" crossorigin href="/wakeup/assets/index-B-T1koLx.css">
  </head>
  <body>
    <div id="root">
      <div
        class="startup-shell"
        data-cabinet="vt100"
        data-mode="app"
        aria-hidden="true"
      >
        <div class="startup-shell__screen">
          <div class="startup-warning">SOURCE MODE REQUIRES HTTP SERVER

OPEN:
  http://127.0.0.1:4173/

THE file:// PAGE DOES NOT RUN THE VITE APP
AND DOES NOT SHARE THE SAME SAVED CABINET STATE.</div>
        </div>
      </div>
    </div>
    <script>
      (function () {
        try {
          var raw = window.localStorage.getItem("w1975.cabinet");
          var cabinet = raw ? JSON.parse(raw) : "vt100";
          var shell = document.querySelector(".startup-shell");
          if (shell && typeof cabinet === "string") {
            shell.setAttribute("data-cabinet", cabinet);
          }
          if (shell && window.location.protocol === "file:") {
            shell.setAttribute("data-mode", "file");
          }
        } catch {}
      })();
    </script>
  </body>
</html>
