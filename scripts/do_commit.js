const { execSync } = require('child_process');
const cwd = 'c:\\Users\\sds\\Desktop\\tset\\Woldeok-Moneyverse-Migration';
console.log(execSync('git add frontend/src/ scripts/', { cwd, encoding: 'utf-8' }));
console.log(execSync('git commit -m "fix(i18n): localize remaining 14 pages and calculator presets H1 headings"', { cwd, encoding: 'utf-8' }));
console.log(execSync('git push origin main', { cwd, encoding: 'utf-8' }));
