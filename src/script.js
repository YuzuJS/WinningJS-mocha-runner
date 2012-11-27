(function () {
    "use strict";

    var indirectEval = eval;

    WinJS.Application.start();
    mocha.setup({ ui: "bdd" });
    connect();

    function onDataReceived(data) {
        indirectEval(data);
        mocha.run();
    }

    function reset() {
        document.getElementById("mocha").innerHTML = "";
        mocha.suite.tests = [];
        mocha.suite.suites = [];
    }

    function connect() {
        var connection = new WebSocket("ws://localhost:8080");

        connection.onerror = function (error) {
            console.error(error);
            retry();
        };

        connection.onclose = function () {
            console.log("WebSocket connection closed");
            retry();
        };

        connection.onmessage = function (ev) {
            onDataReceived(ev.data);
        };
    }

    var isRetrying = false;
    function retry() {
        if (isRetrying) {
            return;
        }
        isRetrying = true;

        setTimeout(function () {
            reset();
            connect();
            isRetrying = false;
        }, 500);
    }
}());