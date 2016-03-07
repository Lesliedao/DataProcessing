/*
/ D3 Line
/ Leslie Dao
/ 10561234
/
/ Maakt een lijngrafiek met de gemiddelde dagtemperatuur in Rotterdam in 2014 (in 0.1 graden Celsius)
/
/ Voorbeeldbron: http://bl.ocks.org/mbostock/3883245
/ Databron: http://projects.knmi.nl/klimatologie/daggegevens/selectie.cgi
*/

var margin = {top: 20, bottom: 30, right: 130, left: 50};
var width = 1350 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

// De data in de data van het KNMI hebben de volgende format
var dateFormat = d3.time.format("%Y%m%d");
// Bisect functie die gebruikt wordt bij het vinden van de dichtstbijzijnde waarde voor de tooltip
var bisectDate = d3.bisector(function(d) {return d.date;}).left;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(24);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .x(function(d) {return x(d.date);})
    .y(function(d) {return y(d.avg);})

var data;
d3.csv("data.csv", function(d) {
    return {
        // dateFormat kijkt naar UTC tijd dus loopt 1 uur achter; zet dat weer terug
        date: new Date(dateFormat.parse(d.date) - new Date().getTimezoneOffset() * 60 * 1000),
        avg: +d.avg,
        min: +d.min,
        max: +d.max
    };
}, function(error, rows) {
        // Extent bepaalt het minimum en het maximum. Nice zorgt voor mooiere afkapwaarden.
        x.domain(d3.extent(rows, function(d) {return d.date;})).nice();
        y.domain(d3.extent(rows, function(d) {return d.avg;}));

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 3)
                .attr("dy", ".75em")
                .style("text-anchor", "end")
                .text("Temperatuur in 0.1 graden C");

        svg.append("path")
            .datum(rows)
            .attr("class", "line")
            .attr("d", line);

        // Tooltip (Bronnen: http://bl.ocks.org/mbostock/3902569, http://bl.ocks.org/mikehadlow/93b471e569e31af07cd3)
        var focus = svg.append("g")
            .attr("class", "focus")
            .style("display", "none");

        // Crosshair
        focus.append("line")
            .attr("id", "crosshairX")
            .attr("class", "crosshair");
        focus.append("line")
            .attr("id", "crosshairY")
            .attr("class", "crosshair");

        focus.append("text");

        svg.append("rect")
            .attr("class", "canvas")
            .attr("width", width)
            .attr("height", height)
            .on("mouseover", function() {focus.style("display", null);})
            .on("mouseout", function() {focus.style("display", "none");})
            .on("mousemove", updateTooltip);

        function updateTooltip() {
            // 0e element is de x-coordinaat
            var x0 = x.invert(d3.mouse(this)[0]);
            // Zoek de index bij x0
            var i = bisectDate(rows, x0);

            var d;
            if (i == 0) {
                d = rows[0];
            }
            else if (i >= (rows.length - 1)) {
                d = rows[rows.length - 1];
            }
            else {
                // Zoek de twee waarden rond de cursor
                var d0 = rows[i - 1], d1 = rows[i];

                // Bepaal welke van de twee waarden dichter bij de cursor ligt
                d = x0 - d0.avg > d1.avg - x0 ? d1 : d0;
            }

            var chX = x(d.date);
            var chY = y(d.avg);

            focus.select("#crosshairY")
                .attr("x1", chX)
                .attr("x2", chX)
                .attr("y1", y(d3.min(rows, function(d) {return d.avg;})))
                .attr("y2", y(d3.max(rows, function(d) {return d.avg;})));
            focus.select("#crosshairX")
                .attr("x1", x(d3.min(rows, function(d) {return d.date;})))
                .attr("x2", x(d3.max(rows, function(d) {return d.date;})))
                .attr("y1", chY)
                .attr("y2", chY);

            focus.select("text")
                .attr("x", chX + 5)
                .attr("y", chY)
                .attr("dy", "-.35em")
                .text(d.date.getFullYear() + "/" + (d.date.getMonth() + 1) + "/" + d.date.getDate() + ": " + d.avg / 10 + "C");
        }

});
