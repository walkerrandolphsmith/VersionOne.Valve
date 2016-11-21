const gulp              = require('gulp');
const fs                = require('fs');
const path              = require('path');
const Handlebars        = require('handlebars');
const Metalsmith        = require('metalsmith');
const collections       = require('metalsmith-collections');
const markdown          = require('metalsmith-markdown');
const templates         = require('metalsmith-templates');
const permalinks        = require('metalsmith-permalinks');
const ignore            = require('metalsmith-ignore');
const toc               = require('./plugins/toc');
const renderer          = require('./plugins/renderer');
const highlighter       = require('./plugins/highlighter');
const config            = require('./config');

const src = path.resolve('../', '_docs', config.src);
const dest = path.resolve('../', config.dest);

const DOMAIN = `http://www.github.com/walkerrandolphsmith/VersionOne.Valve`;

const PROTOCOL = 'http';
const HOST = 'localhost';
const PORT = 3000;
const url = process.env.NODE_ENV === 'production' ? DOMAIN : `${PROTOCOL}://${HOST}:${PORT}`;

const templatePath = `${src}/templates`;
const partialPath = `${templatePath}/partials`;

Handlebars.registerPartial({
    head: fs.readFileSync(`${partialPath}/head.hbt`).toString(),
    header: fs.readFileSync(`${partialPath}/header.hbt`).toString(),
    footer: fs.readFileSync(`${partialPath}/footer.hbt`).toString(),
    hero: fs.readFileSync(`${partialPath}/hero.hbt`).toString(),
    nav: fs.readFileSync(`${partialPath}/nav.hbt`).toString()
});

Handlebars.registerHelper('baseUrl', () => url);
Handlebars.registerHelper('dropIndexHtml', url => url.replace('.html', ''));

gulp.task('metalsmith', () => {
    Metalsmith(__dirname)
        .source(`../` + config.src)
        .destination(`../` + config.dest)
        .use(ignore(['**/*.less', '**/*.js']))
        .use(collections({
            Home: {
                pattern: ''
            },
            SDK: {
                pattern: 'content/sdk/*.md'
            },
            Javascript: {
                pattern: 'content/javascript/*.md'
            },
            Glance: {
                pattern: 'content/glance/*.md'
            },
            Utilities: {
                pattern: 'content/utilities/*.md'
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
            directory: templatePath
        }))
        .use(permalinks({pattern: ':title', relative: false}))
        .build(err => {
            if (err) {
                console.log("ERROR", err);
            }
        });
});