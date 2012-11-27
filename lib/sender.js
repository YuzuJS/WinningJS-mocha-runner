"use strict";

var WebSocketServer = require("ws").Server;
var browserify = require("browserify");

module.exports = function (testFileNames, port) {
    port = port === undefined ? 8080 : port;

    var bundle = browserify();
    testFileNames.forEach(bundle.addEntry.bind(bundle));
    var bundleSrc = bundle.bundle();

    var wss = new WebSocketServer({ port: port });
    wss.on("connection", function (ws) {
        ws.send(bundleSrc);
    });
};
