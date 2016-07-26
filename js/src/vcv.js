var VCV = (function () {
    "use strict";

    var that = {},
        jsonFileLoader;

    function initFileLoader() {
        jsonFileLoader = VCV.FileLoader.init();
    }

    function onJSONLoaded() {

    }

    function init() {
        initFileLoader();

        return that;
    }

    that.init = init;
    return that;
}());
