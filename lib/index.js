"use strict";

var WebSocketServer = require("ws").Server;
var browserify = require("browserify");
var activate = require("winningjs-activator");

var messageHandlers = {
    console: function (method, args) {
        process.stdout.write(method + "> ");
        console[method].apply(console, args);
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

        ws.send(bundleSrc);
    });
}

module.exports = function (testFileNames, options, cb) {
    setupServer(testFileNames, options);
    activate("WinningJS-test-runner_aw9cjjms6ptaw!App", cb);
};
