Set-Location D:\WebCooler
git checkout --orphan gh-pages
git rm -rf --cached . | Out-Null
Remove-Item -Force -ErrorAction SilentlyContinue .gitignore
Copy-Item -Path dist\* -Destination . -Recurse -Force
git add -A
git -c user.name="WebCooler" -c user.email="webcooler@local" commit -m "deploy: fix preview focus/scroll issue"
git push -u origin gh-pages --force
git checkout main
Write-Output "PUBLISH_DONE"
