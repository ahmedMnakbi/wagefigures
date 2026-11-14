@echo off
REM One-click deploy for WageFigures. Double-click this file.
REM 1) installs GitHub CLI if missing  2) signs you in to GitHub (browser opens)  3) builds + publishes to GitHub Pages
cd /d "%~dp0"

REM GitHub CLI is normally at "C:\Program Files\GitHub CLI"; make sure it is on PATH for this window.
set "PATH=%PATH%;%ProgramFiles%\GitHub CLI"
where gh >nul 2>&1
if errorlevel 1 (
  echo Installing GitHub CLI...
  winget install --id GitHub.cli -e --accept-source-agreements --accept-package-agreements --silent
  set "PATH=%PATH%;%ProgramFiles%\GitHub CLI"
)

gh auth status >nul 2>&1
if errorlevel 1 (
  echo.
  echo You need to sign in to GitHub once. A browser window will open; if you have no GitHub account yet,
  echo create one there first (free), then come back and press Enter in this window when asked.
  echo.
  gh auth login --hostname github.com --git-protocol https --web
  if errorlevel 1 (
    echo Sign-in did not complete. Run this file again when ready.
    pause
    exit /b 1
  )
)

if not exist node_modules (
  echo Installing dependencies...
  call npm install --no-audit --no-fund
)

echo.
echo Building and deploying...
call npm run deploy
echo.
echo Done. If a URL was printed above, the site will be live there in about a minute.
echo Next steps are in HANDOFF.md (domain, Search Console, AdSense).
pause
