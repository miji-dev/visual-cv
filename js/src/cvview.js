/* global VCV, d3 */
VCV.CVView = (function () {
    "use strict";

    var that = {},
        el;

    function init(options) {
        el = options.el;

        return that;
    }

    function draw(data) {
        var tasks = data.tasks;
        var taskStatus = data.status;

        var taskNames = [];

        tasks.sort(function (a, b) {
            return a.endDate - b.endDate;
        });

        var maxDate = tasks[tasks.length - 1].endDate;
        tasks.sort(function (a, b) {
            return a.startDate - b.startDate;
        });
        var minDate = tasks[0].startDate;

        console.log(tasks, taskNames, minDate, maxDate);

        tasks.forEach(function (task) {
            if (taskNames.indexOf(task.taskName) < 0) {
                taskNames.push(task.taskName);
            }
        });

        taskNames.reverse();

        var format = "%Y";

        var gantt = d3.gantt().taskTypes(taskNames).taskStatus(taskStatus).tickFormat(format);

        gantt.selector(el);
        gantt.width("1000");
        //gantt.timeDomain([new Date("Sun Dec 09 04:54:19 EST 2012"),new Date("Sun Jan 09 04:54:19 EST 2013")]);
        //gantt.timeDomainMode("fixed");
        gantt(tasks);
    }

    that.init = init;
    that.draw = draw;

    return that;
}());
