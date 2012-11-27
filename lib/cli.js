"use strict";

var activateAndSendTests = require("./index");
var glob = require("glob");
var _ = require("underscore");

function globSync(x) {
    return glob.sync(x);
}

var testFiles = _.flatten(process.argv.slice(2).map(globSync));

activateAndSendTests(testFiles, function (err) {
    if (err) {
        throw err;
    }
});
