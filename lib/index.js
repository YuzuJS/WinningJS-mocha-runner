"use strict";

var activate = require("winningjs-activator");
var sender = require("./sender");

module.exports = function (testFileNames, cb) {
    activate("WinningJS-test-runner_aw9cjjms6ptaw!App", function (err) {
        if (err) {
            cb(err);
            return;
        }

        sender(testFileNames);
        cb();
    });
};
