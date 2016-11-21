module.exports = (isLogging) => (files, metalsmith, done) => {
    if(isLogging) {
        var meta = metalsmith.metadata();
        console.log( meta );
        console.log( Object.keys(meta) );
        console.log( Object.keys(meta.collections) );
    }

    done();
};
