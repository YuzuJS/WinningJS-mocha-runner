"use strict";

var WebSocketServer = require("ws").Server;
var browserify = require("browserify");
var activate = require("winningjs-activator");
var STATUS_TESTS_FAILED = 4001;
var acceptableSocketCloseStatusCodes = [1000, 4000, STATUS_TESTS_FAILED];

var messageHandlers = {
    console: function (method, args) {
        process.stdout.write(method + "> ");
        console[method].apply(console, args);
    },
    stats: function (theStats) {
        var title;
        var msg;

        if (theStats.failures) {
            title = "TESTS HAVE FAILED!";
            msg = theStats.failures + " of " + theStats.tests + " tests failed.";
        } else {
            title = "Tests have passed :)";
            msg = theStats.passes + " tests passed in " + theStats.duration + "ms.";
        }

        console.log("Tests have finished running.");
        console.log(title);
        console.log(msg);
    }
};

function setupServer(testFileNames, options, port) {
    port = port === undefined ? 8080 : port;

    var browserifySetup = options && options.browserifySetup;
    var bundle = browserify();

    if (browserifySetup && typeof browserifySetup === "function") {
        browserifySetup(bundle);
    }

    testFileNames.forEach(bundle.addEntry.bind(bundle));
    var bundleSrc = bundle.bundle();

    var wss = new WebSocketServer({ port: port });
    wss.on("connection", function (ws) {
        ws.on("message", function (string) {
            var message = JSON.parse(string);
            messageHandlers[message[0]].apply(null, message.slice(1));
        });

        ws.on("close", function (statusCode) {
            var exitCode;
            if (acceptableSocketCloseStatusCodes.indexOf(statusCode) >= 0) {
                exitCode = statusCode === STATUS_TESTS_FAILED ? 1 : 0;
            } else {
                console.error("Web socket terminated unexpectedly with status code " + statusCode);
                exitCode = 1;
            }
            process.exit(exitCode);
        });

        ws.send(bundleSrc);
    });
}

module.exports = function (testFileNames, options, cb) {
    setupServer(testFileNames, options);
    activate("WinningJS-test-runner_aw9cjjms6ptaw!App", cb);
};
