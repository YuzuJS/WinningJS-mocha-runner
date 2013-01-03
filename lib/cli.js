"use strict";

var program = require("commander");
var fs = require("fs");
var path = require("path");
var glob = require("glob");
var _ = require("underscore");
var activateAndSendTests = require("./index");

var exists = fs.existsSync;
var cwd = process.cwd();

function globSync(x) {
    return glob.sync(x);
}

program
    .version(require("../package.json").version)
    .option("-b, --browserify-setup <path>", "Module to call to customize the browserify setup.")
    .parse(process.argv);

var options = {};

if (program.browserifySetup) {
    var module = program.browserifySetup;
    var abs = exists(module) || exists(module + ".js");
    if (abs) {
        module = path.resolve(cwd, module);
        options.browserifySetup = require(module);
    }
}

var testFiles = _.flatten(process.argv.slice(2).map(globSync));

activateAndSendTests(testFiles, options, function (err) {
    if (err) {
        throw err;
    }
});
