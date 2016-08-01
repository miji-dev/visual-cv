/* global d3 */
if (!d3) {
    // TODO: throw error
}

d3.cv = function (options) {
    "use strict";

    var that = {},
        // options with default values
        periodData = options.periodData || [],
        momentData = options.momentData || [],
        chartHeight = options.chartHeight || 0,
        chartWidth = options.chartWidth || 0,
        chartMargin = options.chartMargin || {
            top: 20,
            right: 40,
            bottom: 20,
            left: 20
        },
        chartSelector = options.chartSelector || "body",
        chartContainer = document.querySelector(chartSelector),
        tickFormat = options.tickFormat || "%Y",
        periodThreshold = options.periodThreshold || 28,
        showTooltips = options.showTooltips || true,
        transitionDuration = options.transitionDuration || 1000,
        // some other data
        barHeight,
        circleRadius = 20,
        levels = [],
        timeDomainStart,
        timeDomainEnd,
        xFunction,
        yFunction,
        xAxis,
        yAxis; // Do we need a yAxis?

    function calcChartSize() {
        if (!chartContainer) {
            //TODO: throw error
        }

        chartWidth = chartContainer.clientWidth;
        chartHeight = chartContainer.clientHeight;
    }

    function showTooltip(d) {
        var div = document.createElement("div");

        div.id = "tooltip";
        div.className = "tooltip";
        div.innerHTML = "<h4 class='tooltip-title'>" + (d.title || "No title") + "</h4><div class='tooltip-content'><p>" + (d.desc || "") + "</p><p>Von " + pad(d.startDate.getDate()) + "." + pad(d.startDate.getMonth() + 1) + "." + d.startDate.getFullYear() + " bis " + pad(d.endDate.getDate()) + "." + pad(d.endDate.getMonth() + 1) + "." + d.endDate.getFullYear() + "</p></div>";

        chartContainer.appendChild(div);
    }

    function hideTooltip() {
        chartContainer.removeChild(chartContainer.querySelector("#tooltip"));
    }

    function draw() {
        var svg, bar, circles;

        svg = d3.select(chartSelector)
            .append("svg")
            .attr("class", "chart")
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .append("g")
            .attr("class", "d3-cv")
            .attr("width", chartWidth)
            .attr("height", chartHeight);

        bar = svg.selectAll(".chart")
            .data(periodData)
            .enter()
            .append("g");

        bar.append("rect")
            .attr("class", setRectClass)
            .style("stroke", "#fff")
            .attr("y", 0)
            .attr("transform", rectTransform)
            .attr("height", barHeight)
            .transition()
            .duration(transitionDuration)
            .attr("width", calcBarWidth);

        circles = svg.selectAll(".chart")
            .data(momentData)
            .enter()
            .append("g");

        circles.append("circle")
            .attr("r", circleRadius)
            .attr("cx", circleX)
            .attr("cy", circleY)
            .attr("class", setCircleClass);

        if (showTooltips) {
            bar.on("mouseenter", showTooltip).on("mouseleave", hideTooltip);
            circles.on("mouseenter", showTooltip).on("mouseleave", hideTooltip);
        }

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, " + (chartHeight - chartMargin.top - chartMargin.bottom) + ")")
            .transition()
            .duration(transitionDuration)
            .call(xAxis);
    }

    function pad(n) {
        return n < 10 ? "0" + n : n;
    }

    function calcBarWidth(d) {
        return xFunction(d.endDate || new Date()) - xFunction(d.startDate);
    }

    function rectTransform(d) {
        return "translate(" + xFunction(d.startDate) + "," + (chartHeight - chartMargin.top - chartMargin.bottom - (barHeight + 1) * d.level) + ")";
    }

    function circleX(d) {
        return xFunction(d.startDate);
    }

    function circleY(d) {
        var y = chartHeight - chartMargin.bottom - chartMargin.top - (circleRadius * 2) * d.level;
        return y;
    }

    function setRectClass(d) {
        return "bar " + (d.type ? "bar-" + d.type : "");
    }

    function setCircleClass(d) {
        return "circle pulse " + (d.type ? "circle-" + d.type : "");
    }

    function initTimeDomain() {
        if (periodData === undefined || periodData.length < 1) {
            timeDomainStart = d3.timeDay.offset(new Date(), -3);
            timeDomainEnd = d3.timeHour.offset(new Date(), +3);
        } else {
            periodData.sort(function (a, b) {
                return a.endDate - b.endDate;
            });

            timeDomainEnd = periodData[periodData.length - 1].endDate;

            periodData.sort(function (a, b) {
                return a.startDate - b.startDate;
            });

            periodData.forEach(function (d, ind) {
                d.id = ind;
            });

            timeDomainStart = periodData[0].startDate;
        }
    }

    function initXAxis() {
        xFunction = d3.scaleTime()
            .domain([timeDomainStart, timeDomainEnd])
            .range([0, chartWidth])
            .clamp(true);

        xAxis = d3.axisBottom(xFunction)
            .tickFormat(d3.timeFormat(tickFormat));
    }

    function initYAxis() {
        yFunction = d3.scaleBand()
            .domain(levels)
            .rangeRound([0, chartHeight - chartMargin.top - chartMargin.bottom], 0);

        yAxis = d3.axisLeft(yFunction).tickSize(0);

        barHeight = Math.floor((chartHeight - chartMargin.bottom - chartMargin.top) / (levels.length + 1)) - 2;
    }

    function preProcessData() {
        var tempPeriodData = [];

        // iterate through momentData
        momentData.forEach(function (d) {

            // if any date isn't set, set it to now or the startDate respectively
            d.startDate = d.startDate ? new Date(d.startDate) : new Date();
            d.endDate = d.endDate ? new Date(d.endDate) : d.startDate;
        });

        // iterate through periodData
        periodData.forEach(function (d) {

            // if any date isn't set, set it to now
            d.startDate = d.startDate ? new Date(d.startDate) : new Date();
            d.endDate = d.endDate ? new Date(d.endDate) : new Date();

            // is the time difference smaller than the threshold?
            if (Math.ceil((d.endDate.getTime() - d.startDate.getTime()) / (1000 * 3600 * 24)) < periodThreshold) {

                // if so, it's not a period, it's a moment, sorry.
                momentData.push(d);
            } else {

                // if not, it can stay a period
                tempPeriodData.push(d);
            }
        });

        momentData.sort(function (a, b) {
            return a.startDate - b.startDate;
        });

        periodData = tempPeriodData;
    }

    function calcMomentLevels() {
        var i, j, l, d, e;

        for (i = 0, l = momentData.length; i < l; i++) {
            d = momentData[i];
            d.blockedLevels = [];
            d.level = 1;

            for (j = 0; j < i; j++) {
                e = momentData[j];

                if (isInDateRange(d.startDate, e.startDate)) {
                    d.blockedLevels.push(e.level);
                }
            }

            d.blockedLevels.sort(function (a, b) {
                return a - b;
            });

            // iterate through all blocked levels for the current data
            for (j = 0; j < d.blockedLevels.length; j++) {

                // is level j + 1 blocked?
                if (j + 1 < d.blockedLevels[j]) {

                    // if not, set the level for the current data and gtfo
                    d.level = j + 1;
                    break;
                } else {
                    // all levels are blocked, so create a new one above
                    d.level = j + 2;

                    // and add it to the levels array, if not exists
                    if (levels.indexOf(d.level) < 0) {
                        levels.push(d.level);
                    }
                }
            }
        }
    }

    function isInDateRange(postDate, prevDate) {
        var threshold = 2629746000,
            postMs = postDate.getTime(),
            preMs = prevDate.getTime();

        console.log(postDate, prevDate)

        console.log(postMs, preMs, preMs - threshold, preMs + threshold);

        if (postMs >= (preMs - threshold) && postMs <= (preMs + threshold)) {
            console.log("true")
            return true;
        }
        return false;
    }

    function calcPeriodLevels() {
        var i, j, l, d, e;

        // preset levels array
        levels = [1];

        // iterate through periodData
        for (i = 0, l = periodData.length; i < l; i++) {
            // store current data locally, init blockedLevels and preset level to 1
            d = periodData[i];
            d.blockedLevels = [];
            d.level = 1;

            // and again to compare the data with all previous data
            for (j = 0; j < i; j++) {
                // store current previous data locally
                e = periodData[j];

                // do some data overlap?
                if (d.startDate <= e.endDate) {

                    // if so, the previous data level is blocked for the current data
                    d.blockedLevels.push(e.level);

                    // push the level to the levels array, if not exists
                    if (levels.indexOf(e.level) < 0) {
                        levels.push(e.level);
                    }
                }
            }

            // now sort all blocked levels for the current data
            d.blockedLevels.sort(function (a, b) {
                return a - b;
            });

            // iterate through all blocked levels for the current data
            for (j = 0; j < d.blockedLevels.length; j++) {

                // is level j + 1 blocked?
                if (j + 1 < d.blockedLevels[j]) {

                    // if not, set the level for the current data and gtfo
                    d.level = j + 1;
                    break;
                } else {
                    // all levels are blocked, so create a new one above
                    d.level = j + 2;

                    // and add it to the levels array, if not exists
                    if (levels.indexOf(d.level) < 0) {
                        levels.push(d.level);
                    }
                }
            }
        }
    }

    function init() {
        calcChartSize();
        preProcessData();
        initTimeDomain();
        calcPeriodLevels();
        calcMomentLevels();
        initXAxis();
        initYAxis();
        draw();
    }

    init();

    return that;
};
