const gulp              = require('gulp');
const shell             = require('gulp-shell');
const del               = require('del');
const runSequence       = require('run-sequence');
const less              = require('gulp-less');
const rename            = require('gulp-rename');
const LessAutoprefix    = require('less-plugin-autoprefix');
const cleanCSS          = require('gulp-clean-css');
const browserSync       = require("browser-sync");
//Metalsmith deps
const Handlebars        = require('handlebars');
const Metalsmith        = require('metalsmith');
const collections       = require('metalsmith-collections');
const markdown          = require('metalsmith-markdown');
const templates         = require('metalsmith-templates');
const permalinks        = require('metalsmith-permalinks');
const ignore            = require('metalsmith-ignore');
const prism             = require('prismjs');
const marked            = require('marked');
const assign            = require('lodash.assign');
const slug              = require('slug');

const src = './_docs';
const dest = './docs';

const config = {
    src: src,
    dest: dest,
    templates: `${src}/templates`,
    styles: {
        src: `${src}/css/index.less`,
        glob: `${src}/css/**/*.less`,
        dest: `${dest}/css`,
        name: 'styles.css'
    },
    scripts: {
        src: `${src}/index.js`,
        dest: `${dest}/index.js`
    },
    assets: {
        src: `${src}/css/{fonts,images}/**/*.*`,
        dest: `${dest}/css`
    },
    url: process.env.NODE_ENV === 'production'
        ? 'http://walkerrandolphsmith.com/VersionOne.Valve/' : 'http://localhost:3000'
};

Handlebars.registerHelper('baseUrl', () => config.url);
Handlebars.registerHelper('collectionNav', context => new Handlebars.SafeString(
    Object
        .keys(context.collections)
        .filter(key => key !== 'Home')
        .map(item => `<li><a href="${config.url}/${item.toLowerCase()}" title="${item}">${item}</a></li>`)
        .join('')
));
Handlebars.registerHelper('dropIndexHtml', url => url.replace('.html', ''));

gulp.task('metalsmith', () => {

    const highlighter = (code, lang) => {
        if (!prism.languages.hasOwnProperty(lang)) {
            lang = lang === 'js' ? 'javascript' : 'markup';
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

    const toc = function (opts) {
        const options = opts || {};
        options.selector = options.selector || 'h2, h3, h4, h5, h6';
        options.headerIdPrefix = options.headerIdPrefix || '';

        const assign = require('lodash.assign');
        const slug = require('slug');
        const tocMarked = require('marked');
        let GLOBAL_FILE_NAME = '';
        let currentHeadings = [];

        const tocRenderer = new tocMarked.Renderer();
        const replacePattern = (str, pattern, replacement) => str.split(pattern).join(replacement).toLowerCase();
        const replacePatterns = (str, patterns, replacement) => {
            patterns.forEach(pattern => {
                str = replacePattern(str, pattern, replacement);
            });
            return str;
        };

        tocRenderer.heading = function(text, level) {
            currentHeadings.push({
                title: replacePatterns(GLOBAL_FILE_NAME, [' ', '?'], '-'),
                text,
                slug: replacePatterns(text, [' ', '?'], '-')
            });
        };

        tocMarked.setOptions({ renderer: tocRenderer });
        
        const getTitle = (path) => {
            const groups = path.split('/');
            return groups.length === 1 ? 'Home' : groups[groups.length - 2];
        };

        return function (files, metalsmith, done) {
            for(let key in files) {
                if (/md/.test(key)) {
                    const title = getTitle(key);
                    currentHeadings = [];
                    GLOBAL_FILE_NAME = title;
                    const markdownString = files[key].contents.toString('utf-8');
                    tocMarked(markdownString);
                    assign(files[key], {toc: currentHeadings})
                }
            }
            done();
        };
    };

    Metalsmith(__dirname)
        .source(src)
        .destination(dest)
        .use(ignore(['**/*.less', '**/*.js', 'templates/**/*.*']))
        .use(collections({
            Home: {
                pattern: ''
            },
            SDK: {
                pattern: 'sdk/*.md'
            },
            Javascript: {
                pattern: 'javascript/*.md'
            },
            Glance: {
                pattern: 'glance/*.md'
            },
            Utilities: {
                pattern: 'utilities/*.md'
            },
            CTM: {
                pattern: 'ctm/*.md'
            }
        }))
        .use(toc())
        .use(markdown({
            gfm: true,
            smartypants: true,
            renderer: renderer,
            langPrefix: 'language-',
            highlight: highlighter
        }))
        .use(templates({
            engine: 'handlebars',
            directory: config.templates
        }))
        .use(permalinks({pattern: ':title', relative: false}))
        .build(err => {
            if (err) {
                console.log("ERROR", err);
            }
        });
});

gulp.task('clean', () => del([ config.dest ], { force: true }));

gulp.task('assets', () => gulp.src(config.assets.src).pipe(gulp.dest(config.assets.dest)));

gulp.task('scripts', shell.task([`babel ${config.scripts.src} --out-file ${config.scripts.dest}`]));

gulp.task('styles', () => gulp
    .src(config.styles.src)
    .pipe(less({ plugins: [new LessAutoprefix({ browsers: ['last 2 versions'] })] }))
    .pipe(rename(config.styles.name))
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(gulp.dest(config.styles.dest))
);

gulp.task('build', callback => runSequence('clean', ['metalsmith', 'scripts', 'styles', 'assets'], callback));

gulp.task('dev', ['build'], () => {
    browserSync.init({ server: config.dest, port: 3000 });

    gulp.watch(config.blogPatterns, ['metalsmith']);
    gulp.watch(config.blogPatterns).on('change', browserSync.reload);

    gulp.watch(config.scripts.glob, ['scripts']);
    gulp.watch(config.scripts.glob).on('change', browserSync.reload);

    gulp.watch(config.styles.glob, ['styles']);
    gulp.watch(config.styles.glob).on('change', browserSync.reload);
});