var seleniumStandalone = require('selenium-standalone');

module.exports = (function () {
    var selenium;
    return {
        start: function (done) {
            function startSelenium(startPort, endPort, callback) {
                function trySelenium(port, endPort, cb) {
                    seleniumStandalone.start({seleniumArgs: ['-port', port]}, function (err, process) {
                        if (err) {
                            console.log("Port already in use: ", port)

                            if (port == endPort)
                                return cb(err);

                            return trySelenium(++port, endPort, cb);
                        }

                        console.log("Selenium started");
                        console.log("Using port: ", port)

                        selenium = process;

                        cb(null, port)
                    });
                }

                trySelenium(startPort, endPort, callback);
            }

            seleniumStandalone.install(function (err, result) {
                if (err) return callback(err);
                console.log("Selenium Installed");

                startSelenium(4444, 4454, done);
            });

            if (process.platform === "win32") {
                var rl = require("readline").createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                rl.on("SIGINT", function () {
                    process.emit("SIGINT");
                });
            }

            process.on("SIGINT", function () {
                //graceful shutdown
                process.exit();
            })
        },

        stop: function () {
            if (selenium)
                selenium.kill();

            console.log("Selenium stopped");
        }
    }
})();