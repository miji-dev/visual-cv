/* global d3 */
if (!d3) {
    // TODO: throw error
}

d3.cv = function (options) {
    "use strict";

    var that = {},
        // data: startDate, endDate, type
        // moment: startDate = endDate
        // type: category of data
        periodData = options.periodData,
        momentData = options.momentData,
        // d3 layout stuff
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
        barHeight = options.barHeight || 20,
        // d3 formating stuff
        levels = [],
        tickFormat = options.tickFormat || "%Y",
        timeDomainStart,
        timeDomainEnd,
        periodThreshold = options.periodThreshold || 28,
        xFunction,
        yFunction,
        yAxis, // Do we need a yAxis?
        xAxis;

    function calcChartSize() {
        if (!chartContainer) {
            //TODO: throw error
        }

        chartWidth = chartContainer.clientWidth;
        chartHeight = chartContainer.clientHeight;
    }

    function draw() {
        var svg = d3.select(chartSelector)
            .append("svg")
            .attr("class", "chart")
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .append("g")
            .attr("class", "d3-cv")
            .attr("width", chartWidth)
            .attr("height", chartHeight),
            bar = svg.selectAll(".chart")
            .data(periodData)
            .enter()
            .append("g");

        bar.append("rect")
            .attr("class", setClass)
            .attr("y", 0)
            .attr("transform", rectTransform)
            .attr("height", barHeight)
            .attr("width", calcBarWidth)
            .on("mouseenter", function (d) {
                var div = document.createElement("div");

                div.id = "tooltip";
                div.className = "tooltip";
                div.innerHTML = "<h4 class='tooltip-title'>" + d.title + "</h4><div class='tooltip-content'><p>" + (d.desc || "") + "</p><p>Von " + pad(d.startDate.getDate()) + "." + pad(d.startDate.getMonth() + 1) + "." + d.startDate.getFullYear() + " bis " + pad(d.endDate.getDate()) + "." + pad(d.endDate.getMonth() + 1) + "." + d.endDate.getFullYear() + "</p></div>";

                chartContainer.appendChild(div);
            }).on("mouseleave", function () {
                chartContainer.removeChild(chartContainer.querySelector("#tooltip"));
            });

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, " + (chartHeight - chartMargin.top - chartMargin.bottom) + ")")
            .transition()
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


    function setClass(d) {
        return "bar " + (d.type ? "bar-" + d.type : "");
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
        xFunction = d3.scaleTime().domain([timeDomainStart, timeDomainEnd]).range([0, chartWidth]).clamp(true);


        xAxis = d3.axisBottom(xFunction)
            .tickFormat(d3.timeFormat(tickFormat));
    }

    function initYAxis() {
        yFunction = d3.scaleBand().domain(levels).rangeRound([0, chartHeight - chartMargin.top - chartMargin.bottom], 0);

        yAxis = d3.axisLeft(yFunction).tickSize(0);

        barHeight = Math.floor((chartHeight - chartMargin.bottom - chartMargin.top) / (levels.length + 1)) - 2;
    }

    function preProcessData() {
        var tempPeriodData = [];
        momentData = [];

        periodData.forEach(function (d) {
            d.startDate = d.startDate ? new Date(d.startDate) : new Date();
            d.endDate = d.endDate ? new Date(d.endDate) : new Date();
            if (Math.ceil((d.endDate.getTime() - d.startDate.getTime()) / (1000 * 3600 * 24)) < periodThreshold) {
                momentData.push(d);
            } else {
                tempPeriodData.push(d);
            }
        });

        periodData = tempPeriodData;
    }

    function calcLevels() {
        var i, j, l, d, e;

        levels = [1];

        for (i = 0, l = periodData.length; i < l; i++) {
            d = periodData[i];
            d.blockedLevels = [];
            d.level = 1;

            for (j = 0; j < i; j++) {
                e = periodData[j];

                if (d.startDate <= e.endDate) {
                    d.blockedLevels.push(e.level);

                    if (levels.indexOf(e.level) < 0) {
                        levels.push(e.level);
                    }

                }
            }

            d.blockedLevels.sort(function (a, b) {
                return a - b;
            });

            for (j = 0; j < d.blockedLevels.length; j++) {
                if (j + 1 < d.blockedLevels[j]) {
                    d.level = j + 1;
                    break;
                } else {
                    d.level = j + 2;
                }
            }
        }
    }

    function init() {
        calcChartSize();
        preProcessData();
        initTimeDomain();
        calcLevels();
        initXAxis();
        initYAxis();
        draw();
    }

    init();

    return that;
};
