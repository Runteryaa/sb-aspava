Add-Content -Path .gitignore -Value "dist/"
git reset HEAD
git add .
git commit -m "feat: package print-server to windows executable installer"
git push origin beta
git checkout main
git merge beta
git push origin main
