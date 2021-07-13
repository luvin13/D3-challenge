// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
    .select(".chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

function xScale(data, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2    
    ])
    .range([0,width]);
return xLinearScale;
}

function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
    return xAxis;
}

function yScale(data, chosenYAxis, ) {
    var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
    d3.max(data, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);
return yLinearScale;
}

function renderAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transtion()
    .duration(1000)
    .call(leftAxis);
    return yAxis;
}

function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circlesGroup.transtion()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
return circlesGroup
}

function makeResponsive() {
    var svgArea = d3.select("#scatter").select("svg");
    if (!svgArea.empty()) {
        svgArea.remove();
    }
    var svgHeight = window.innerHeight/1.2;
    var svgWidth = window.innerWidth/1.7;
    var margin = {
        top: 50,
        right: 50,
        bottom: 100,
        left: 80
    };
    var chartHeight = svgHeight - margin.top - margin.bottom;
    var chartWidth = svgHeight - margin.left - margin.right;
    var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    d3.csv("assests/data/data.csv").then(function(demoData, err) {
        if (err) throw err;
        demoData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
        });

        var xLinearScale = xScale(demoData, chosenXAxis, chartWidth);
        var yLinearScale = yScale(demoData, chosenYAxis, chartHeight);
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(bottomAxis);
        var yAxis = chartGroup.append("g")
            .call(leftAxis);
        var circlesGroup = chartGroup.selectAll("circle")
            .data(demoData);
        var elemEnter = circlesGroup.enter();
        var circle = elemEnter.append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", 15)
            .classed("stateCircle", true);
        var circleText = elemEnter.append("text")
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis]))
            .attr("dy", ".35em")
            .text(d => d.abbr)
            .classed("stateText", true);

        var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circle, circleText);
        var xLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${chartWidth/2}, ${chartHeight + 20})`);
        var povertyLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty")
            .classed("active", true)
            .text("In Poverty (%)");
        var yLabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)");
        var healthCareLabel = yLabelsGroup.append("text")
            .attr("x", 0 -(chartHeight / 2))
            .attr("y", 40 - margin.left)
            .attr("dy", "1em")
            .attr("value", "healthcare")
            .classed("active", true)
            .text("Lacks Healthcare (%)");
        xLabelsGroup.selectAll("text")
        .on("click", function() {
            chosenXAxis = d3.select(this).attr("value");
            xLinearScale = xScale(demoData, chosenXAxis, chartWidth);
            xAxis = renderAxes(xLinearScale, xAxis);
            if (chosenXAxis === "poverty") {
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false)
            } else {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true)
            }
            circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circle, circleText);
            circleText = renderText(circleText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        });
        yLabelsGroup.selectAll("text")
            .on("click", function() {
                chosenYAxis = d3.select(this).attr("value");
                yLinearScale = yScale(demoData, chosenYAxis, chartHeight);
                yAxis = renderAxes(yLinearScale, yAxis);
                if (chosenYAxis === "healthcare") {
                    healthCareLabel
                        .classed("active", true)
                        .classed("inactive", false)
                } else {
                    healthCareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
                circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                circleText = renderText(circleText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circle, circleText);
            });
    }).catch(function(err) {
        console.log(err);
    });
}
makeResponsive();
d3.select(window).on("resize", makeResponsive);
