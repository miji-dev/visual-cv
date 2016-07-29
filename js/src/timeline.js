/* global VCV */
VCV.Timeline = (function () {
    "use strict";

    var that = {},
        tasks = [],
        taskNames = [],
        taskStatus = {};

    function init() {

        return that;
    }

    function set(data) {
        var periodKey, periodVal, entry, id = 1;

        tasks = [];
        taskNames = [];
        taskStatus = [];

        if (data && data.periods) {
            for (periodKey in data.periods) {
                periodVal = data.periods[periodKey];

                taskStatus[periodKey] = "bar-" + periodKey;
                taskNames.push(periodKey);

                periodVal.forEach(function (val) {
                    entry = {};

                    entry.taskName = periodKey;
                    entry.startDate = new Date(val.startDate);
                    entry.endDate = val.endDate ? new Date(val.endDate) : new Date();
                    entry.status = periodKey;
                    entry.id = id++;

                    entry.data = val;

                    console.log(entry)

                    tasks.push(entry);
                });
            }
        }
    }

    function getTasks() {
        return tasks;
    }

    function getTaskNames() {
        return taskNames;
    }

    function getTimelineData() {
        return {
            tasks: tasks,
            taskNames: taskNames,
            status: taskStatus
        };
    }

    that.getTasks = getTasks;
    that.getTimelineData = getTimelineData;
    that.set = set;
    that.getTaskNames = getTaskNames;
    that.init = init;
    return that;
}());
