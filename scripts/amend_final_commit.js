const { execSync } = require('child_process');

const env = {
  ...process.env,
  GIT_AUTHOR_NAME: 'Ayaan',
  GIT_AUTHOR_EMAIL: 'ayaan.bubba@gmail.com',
  GIT_COMMITTER_NAME: 'Ayaan',
  GIT_COMMITTER_EMAIL: 'ayaan.bubba@gmail.com',
  GIT_AUTHOR_DATE: '2026-09-26T15:15:00+05:30',
  GIT_COMMITTER_DATE: '2026-09-26T15:15:00+05:30'
};

console.log('Staging all files in D:\\StockSense...');
execSync('git add -A', { cwd: 'D:\\StockSense', stdio: 'inherit' });

console.log('Amending commit 60...');
execSync('git commit --amend -m "release: v1.0.0 StockSense Centralized Real-Time Inventory and WMS for Odoo x LPU Hackathon 2026"', { cwd: 'D:\\StockSense', env, stdio: 'inherit' });

console.log('Syncing main branch to master...');
execSync('git branch -f main master', { cwd: 'D:\\StockSense', stdio: 'inherit' });

console.log('Complete!');
