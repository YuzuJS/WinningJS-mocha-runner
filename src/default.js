(function () {
    "use strict";

    var socket = null;
    var iframe = document.getElementById("iframe");
    var iframeWindow = iframe.contentWindow;

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

            iframeWindow.mocha.run();
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
