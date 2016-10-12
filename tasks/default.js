var gulp = require('gulp');
const fs = require('fs');
const path = require('path');

gulp.task('default', [], function() {
    const contents = `V1Protocol=http
V1Port=80
V1Host=localhost
V1Instance=VersionOne.Web
V1Username=admin
V1Password=admin`;
    const dir = path.resolve(__dirname, '../');
    fs.writeFile(`${dir}/.env`, contents);
});