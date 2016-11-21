var marked = require('marked');

const renderer = new marked.Renderer();

renderer.code = function(code, lang, escaped) {
    code = this.options.highlight(code, lang);
    const language = lang || 'none';
    const classes = ` class="${this.options.langPrefix}${language} line-numbers"`;
    return `<div class="code-wrapper"><pre${classes}><code${classes}>${code}</code></pre><i class="fa fa-copy"></i></div>`
};

renderer.heading = function(text, level) {
    const t = text.toLowerCase().replace(/[^\w]+/g, '-');

    return `<h${level}><a name="${t}" class="anchor" href="#${t}"></a>${text}</h${level}>`;
};

module.exports = renderer;