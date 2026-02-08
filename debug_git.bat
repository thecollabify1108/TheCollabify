@echo off
cd /d "C:\Users\sukhv\project 2"
echo === BRANCH === > debug_git_log.txt
git branch --show-current >> debug_git_log.txt 2>&1
echo === STATUS === >> debug_git_log.txt
git status >> debug_git_log.txt 2>&1
echo === LOG === >> debug_git_log.txt
git log -n 3 --oneline >> debug_git_log.txt 2>&1
echo === REMOTE === >> debug_git_log.txt
git remote -v >> debug_git_log.txt 2>&1
echo === PUSH === >> debug_git_log.txt
git push origin main >> debug_git_log.txt 2>&1
