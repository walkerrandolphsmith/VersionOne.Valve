var prism = require('prismjs');

var extensions = {
    js:     'javascript',
    less:   'css',
    scss:   'css',
    sass:   'css',
    html:   'markdown',
    svg:    'markup',
    xml:    'markup',
    py:     'python',
    rb:     'ruby',
    ps1:    'powershell',
    psm1:   'powershell'
};

const highlighter = (code, lang) => {
    if (!prism.languages.hasOwnProperty(lang)) {
        lang = extensions[lang] || 'markup';
    }
    const highlightedCode = prism.highlight(code, prism.languages[lang]);

    const numberOfLines = code.split('\n').length;
    const lines = Array
                    .from(Array(numberOfLines), (_, i) => i)
                    .map(() => '<span></span>')
                    .join('');
    const $lineNumbersRows = `<span class="line-numbers-rows">${lines}</span>`;

    return highlightedCode + $lineNumbersRows;
};

module.exports = highlighter;