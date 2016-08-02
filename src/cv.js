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
        chartMargin = options.chartMargin || {
            top: 20,
            right: 40,
            bottom: 20,
            left: 20
        },
        chartSelector = options.chartSelector || "body",
        tickFormat = options.tickFormat || "%Y",
        periodThreshold = options.periodThreshold || 28,
        showTooltips = options.showTooltips || true,
        transitionDuration = options.transitionDuration || 1000,
        stringToday = options.stringToday || "heute",
        circleRadius = options.circleRadius || 20,
        showLegend = options.showLegend || true,
        // some other data
        legendData = [],
        levels = [],
        chartHeight,
        chartWidth,
        chartContainer = document.querySelector(chartSelector),
        barHeight,
        timeDomainStart,
        timeDomainEnd,
        xFunction,
        yFunction,
        xAxis;

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
        div.innerHTML = "<h4 class='tooltip-title'>" + (d.title || "No title") + "</h4><div class='tooltip-content'><p>" + (d.desc || "") + "</p><p>Von " + pad(d.startDate.getDate()) + "." + pad(d.startDate.getMonth() + 1) + "." + d.startDate.getFullYear() + " bis " + (d.ongoing ? stringToday : (pad(d.endDate.getDate()) + "." + pad(d.endDate.getMonth() + 1) + "." + d.endDate.getFullYear())) + "</p></div>";

        chartContainer.appendChild(div);
    }

    function hideTooltip() {
        chartContainer.removeChild(chartContainer.querySelector("#tooltip"));
    }

    function draw() {
        var chart, svg;

        chart = d3.select(chartSelector)
            .append("svg")
            .attr("class", "chart")
            .attr("width", chartWidth)
            .attr("height", chartHeight);

        svg = chart.append("g")
            .attr("class", "d3-cv")
            .attr("width", chartWidth)
            .attr("height", chartHeight);

        drawRects(svg);
        drawCircles(svg);


        drawAxis(chart);

        if (showLegend) {
            drawLegend(chart);
        }
    }

    function drawRects(svg) {
        var bar = svg.selectAll(".chart")
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

        if (showTooltips) {
            bar.on("mouseenter", showTooltip).on("mouseleave", hideTooltip);
        }
    }

    function drawCircles(svg) {
        var circles = svg.selectAll(".chart")
            .data(momentData)
            .enter()
            .append("g");

        circles.append("circle")
            .attr("r", circleRadius)
            .attr("cx", circleX)
            .attr("cy", circleY)
            .attr("class", setCircleClass);

        if (showTooltips) {
            circles.on("mouseenter", showTooltip).on("mouseleave", hideTooltip);
        }
    }

    function drawAxis(chart) {
        chart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, " + (chartHeight - chartMargin.top - chartMargin.bottom) + ")")
            .transition()
            .duration(transitionDuration)
            .call(xAxis);
    }

    function drawLegend(chart) {
        var legend, row = 0,
            col = 0;

        legend = chart.selectAll(".legend")
            .data(legendData)
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", function (d) {
                var y = row * 25,
                    x = col;

                col += d.length * 6 + 50; // magic numbers, try and error

                if (col > chartWidth) {
                    x = 0;
                    col = d.length * 6 + 50; // magic numbers, try and error
                    row++;
                    y = row * 25;
                }
                return "translate(" + x + "," + y + ")";
            });

        legend.append("rect")
            .attr("x", 0)
            .attr("class", function (d) {
                return d;
            })
            .attr("width", 18)
            .attr("height", 18);

        legend.append("text")
            .attr("x", 20)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .style("font-family", "monospace")
            .text(function (d) {
                return d;
            });

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
        return "bar " + (d.type ? d.type : "");
    }

    function setCircleClass(d) {
        return "circle pulse " + (d.type ? d.type : "");
    }

    function initTimeDomain() {
        // if no data at all is given, set some default data, even though it doesn't make sense really, since there is nothing to show
        if ((periodData === undefined || periodData.length < 1) && (momentData === undefined || momentData.length < 1)) {
            timeDomainStart = d3.timeDay.offset(new Date(), -3);
            timeDomainEnd = d3.timeHour.offset(new Date(), +3);
        } else {

            // sort both arrays descending by endDate
            periodData.sort(function (a, b) {
                return b.endDate - a.endDate;
            });
            momentData.sort(function (a, b) {
                return b.endDate - a.endDate;
            });

            // choose the latest endDate as timeDomainEnd
            timeDomainEnd = periodData[0].endDate >= momentData[0].endDate ? periodData[0].endDate : momentData[0].endDate;

            // sort both arrays ascending by startDate
            periodData.sort(function (a, b) {
                return a.startDate - b.startDate;
            });
            momentData.sort(function (a, b) {
                return a.startDate - b.startDate;
            });

            // choose the earliest startDate as timeDomainStart
            timeDomainStart = periodData[0].startDate <= momentData[0].startDate ? periodData[0].startDate : momentData[0].startDate;
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

        d3.axisLeft(yFunction).tickSize(0);

        barHeight = Math.floor((chartHeight - chartMargin.bottom - chartMargin.top) / (levels.length + 1)) - 2;
    }

    function preProcessData() {
        var tempPeriodData = [],
            tempMomentData = [];

        // iterate through momentData
        momentData.forEach(function (d) {
            // if any date isn't set, set it to now or the startDate respectively
            d.startDate = d.startDate ? new Date(d.startDate) : new Date();
            d.endDate = d.endDate ? new Date(d.endDate) : d.startDate;
            // is the time difference smaller than the threshold?
            if (Math.ceil((d.endDate.getTime() - d.startDate.getTime()) / (1000 * 3600 * 24)) < periodThreshold) {
                // if so it's a moment.
                tempMomentData.push(d);
            } else {
                // if not, it's a period
                tempPeriodData.push(d);
            }

            // add type to legendArray if not exists
            if (legendData.indexOf(d.type) < 0) {
                legendData.push(d.type);
            }
        });

        // iterate through periodData
        periodData.forEach(function (d) {
            // if any date isn't set, set it to now
            d.startDate = d.startDate ? new Date(d.startDate) : new Date();
            // if there is no endDate, it's an ongoing event
            if (d.endDate === undefined) {
                d.ongoing = true;
            }
            d.endDate = d.endDate ? new Date(d.endDate) : new Date();
            // is the time difference smaller than the threshold?
            if (Math.ceil((d.endDate.getTime() - d.startDate.getTime()) / (1000 * 3600 * 24)) < periodThreshold) {
                // if so, it's not a period, it's a moment, sorry.
                tempMomentData.push(d);
            } else {
                // if not, it can stay a period
                tempPeriodData.push(d);
            }

            // add type to legendArray if not exists
            if (legendData.indexOf(d.type) < 0) {
                legendData.push(d.type);
            }
        });

        momentData = tempMomentData;
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
        var threshold = 2629746000, // magic number -> 1 month in milliseconds
            postMs = postDate.getTime(),
            preMs = prevDate.getTime();

        if (postMs >= (preMs - threshold) && postMs <= (preMs + threshold)) {
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
