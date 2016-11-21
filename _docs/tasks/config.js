const src = './src';
const dest = './../docs';

const config = {
    src: src,
    dest: dest,
    styles: {
        src: `${src}/css/index.less`,
        glob: `${src}/css/**/*.less`,
        autoprefixTarget: {
            browsers: [
                'last 2 versions'
            ]
        },
        dest: `${dest}/css`,
        name: 'styles.css'
    },
    scripts: {
        src: `${src}/app/index.js`,
        dest: `${dest}/index.js`
    },
    assets: {
        src: `${src}/css/{fonts,images}/**/*.*`,
        dest: `${dest}/css`
    },
    blogPatterns: `${src}/{content,templates}/**/*.*`
};

module.exports = config;