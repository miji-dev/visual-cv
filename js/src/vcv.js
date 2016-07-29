var VCV = (function () {
    "use strict";

    var that = {},
        jsonFileLoader,
        cvView,
        timeline;

    function initFileLoader() {
        jsonFileLoader = VCV.FileLoader.init();
    }

    function onJSONLoaded(data) {
        var json = JSON.parse(data);
        timeline.set(json);
        cvView.draw(timeline.getTimelineData());
    }

    function initViews() {
        cvView = VCV.CVView.init({
            el: document.getElementById("cv")
        });
    }

    function initTimeline() {
        timeline = VCV.Timeline.init();
    }

    function init() {
        initFileLoader();
        initViews();
        initTimeline();

        jsonFileLoader.loadJSON(onJSONLoaded);

        return that;
    }

    that.init = init;
    return that;
}());
