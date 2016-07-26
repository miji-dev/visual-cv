VCV.FileLoader = (function () {
    var that = {},
        FILE_PATH = "test.json";

    function init() {

        return that;
    }

    function loadJSON(callback) {
        var xobj = new XMLHttpRequest();

        xobj.overrideMimeType("application/json");
        xobj.open("GET", FILE_PATH, true);
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                callback(xobj.responseText);
            }
        };
        xobj.send(null);
    }

    that.init = init;
    that.loadJSON = loadJSON;

    return that;
}());
