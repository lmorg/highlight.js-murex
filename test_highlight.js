const hljs = require('highlight.js/lib/core');
const murex = require('./src/index');
hljs.registerLanguage('murex', murex);
const code = 'private git-refs {\n  git branch -a\n}\n';
const result = hljs.highlight(code, { language: 'murex' });
console.log(result.value);
