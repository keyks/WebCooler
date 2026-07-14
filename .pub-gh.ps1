$ErrorActionPreference = 'Continue'
cd d:\WebCooler
git checkout --orphan gh-pages 2>&1 | Out-Null
git rm -rf --cached . 2>&1 | Out-Null
Remove-Item -Force -ErrorAction SilentlyContinue .gitignore
if (Test-Path dist) { Copy-Item -Recurse -Force dist\* . }
git add -A 2>&1 | Out-Null
git -c user.name="WebCooler" -c user.email="webcooler@local" commit -m "deploy: publish static site to gh-pages" 2>&1 | Select-Object -Last 2
git push origin gh-pages --force 2>&1 | Select-Object -Last 3
git checkout main 2>&1 | Out-Null
Write-Output "PUBLISH_DONE"