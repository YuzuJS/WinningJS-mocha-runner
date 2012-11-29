(function () {
    "use strict";

    // Mocha detects us as IE8 and refuses to give us a nice `nextTick` shim.
    process.nextTick = setImmediate.bind(window);

    // Since Mocha handles uncaught errors (using `window.onerror`), don't let them crash the app.
    WinJS.Application.addEventListener("error", function () {
        return true;
    });

    process.on = function (event, listener) {
        if (event === "uncaughtException") {
            listener._adapted = function (ev) {
                listener(ev.detail);
                return true;
            };
            WinJS.Application.addEventListener("error", listener._adapted);
        }
    };
    process.removeListener = function (event, listener) {
        if (event === "uncaughtException") {
            WinJS.Application.removeEventListener("error", listener._adapted);
        }
    };

    ["log", "info", "warn", "error", "dir"].forEach(function (method) {
        var original = console[method];
        console[method] = function () {
            var args = Array.prototype.slice.call(arguments);
            window.socket.send(JSON.stringify(["console", method, args]));

            return original.apply(console, arguments);
        };
    });
}());
