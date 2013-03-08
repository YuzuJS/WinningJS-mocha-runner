(function () {
    "use strict";

    var socket = null;
    var iframe = document.getElementById("iframe");
    var iframeWindow = iframe.contentWindow;

    // WebSocket status codes for private use - http://tools.ietf.org/html/rfc6455#section-7.4
    var STATUS_TESTS_PASSED = 4000;
    var STATUS_TESTS_FAILED = 4001;

    function runScriptInIframe(string) {
        function onLoad() {
            iframe.removeEventListener("load", onLoad);

            iframeWindow.socket = socket;

            iframeWindow.mocha.setup({ ui: "bdd" });
            iframeWindow.mocha.ignoreLeaks = true;

            var scriptEl = iframeWindow.document.createElement("script");
            MSApp.execUnsafeLocalFunction(function () {
                scriptEl.innerHTML = string;
            });
            iframeWindow.document.body.appendChild(scriptEl);

            var runner = iframeWindow.mocha.run(function (failures) {
                var message = ["stats", runner.stats];
                socket.send(JSON.stringify(message));
                var statusCode = runner.stats.failures === 0 ? STATUS_TESTS_PASSED : STATUS_TESTS_FAILED;
                socket.close(statusCode, "Tests have finished running.");
            });
        }

        iframe.addEventListener("load", onLoad);
        iframeWindow.location.reload(true);
    }

    function connect() {
        socket = new WebSocket("ws://localhost:8080");

        socket.onerror = function (error) {
            console.error(error);
            retry();
        };

        socket.onclose = function () {
            console.log("WebSocket connection closed");
            retry();
        };

        socket.onmessage = function (ev) {
            runScriptInIframe(ev.data);
        };
    }

    var isRetrying = false;
    function retry() {
        if (isRetrying) {
            return;
        }
        isRetrying = true;

        setTimeout(function () {
            connect();
            isRetrying = false;
        }, 500);
    }

    connect();
}());
