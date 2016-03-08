/*
/ D3 Line
/ Leslie Dao
/ 10561234
/
/ Maakt een lijngrafiek met de gemiddelde dagtemperatuur in Rotterdam in 2014 (in graden Celsius)
/
/ Voorbeeldbron: http://bl.ocks.org/mbostock/3883245
/ Databron: http://projects.knmi.nl/klimatologie/daggegevens/selectie.cgi
*/

// Afmetingen van de chart
var margin = {top: 20, bottom: 60, right: 130, left: 50};
var width = 1200 - margin.left - margin.right;
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

// Schalen en assen definieren
var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

// Ticks voor elke maand
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(24);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

// De lijn neemt de datum als x- en de gemiddelde temperatuur als y-coordinaat
var line = d3.svg.line()
    .x(function(d) {return x(d.date);})
    .y(function(d) {return y(d.avg);})

// Laad de data in vanuit een csv bestand
d3.csv("data.csv", function(d) {
    return {
        // dateFormat kijkt naar UTC tijd dus loopt 1 uur achter; zet dat weer terug
        date: new Date(dateFormat.parse(d.date) - new Date().getTimezoneOffset() * 60 * 1000),
        avg: (+d.avg) / 10,
        min: +d.min,
        max: +d.max
    };
}, function(error, rows) {
        // Extent bepaalt het minimum en het maximum. Nice zorgt voor mooiere afkapwaarden.
        x.domain(d3.extent(rows, function(d) {return d.date;})).nice();
        y.domain(d3.extent(rows, function(d) {return d.avg;})).nice();

        // Assen toevoegen
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            // Zet de labels aan de x-as schuin, zodat ze elkaar niet overlappen
            .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-45)" );

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            // Een label aan de y-as hangen
            .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 3)
                .attr("dy", ".75em")
                .style("text-anchor", "end")
                .text("Temperatuur in graden Celsius");

        // De lijn tekenen
        svg.append("path")
            .datum(rows)
            .attr("class", "line")
            .attr("d", line);

        // Tooltip (Bronnen: http://bl.ocks.org/mbostock/3902569, http://bl.ocks.org/mikehadlow/93b471e569e31af07cd3)
        var focus = svg.append("g")
            .attr("class", "focus")
            .style("display", "none");

        // Crosshair klaarzetten
        focus.append("line")
            .attr("id", "crosshairX")
            .attr("class", "crosshair");
        focus.append("line")
            .attr("id", "crosshairY")
            .attr("class", "crosshair");

        // Container voor de tooltiptekst
        focus.append("text");

        // Overlay over de chart die de cursor trackt
        svg.append("rect")
            .attr("class", "canvas")
            .attr("width", width)
            .attr("height", height)
            .on("mouseover", function() {focus.style("display", null);})
            .on("mouseout", function() {focus.style("display", "none");})
            .on("mousemove", updateTooltip);

        // De functie die wordt aangeroepen als de cursor over de chart beweegt
        function updateTooltip() {
            // 0e element is de x-coordinaat
            var x0 = x.invert(d3.mouse(this)[0]);
            // Zoek de index bij x0
            var i = bisectDate(rows, x0);

            // Placeholder voor de datum waarvoor de tooltip verschijnt
            var d;
            // Als de index 0 is, laat dan informatie zien van de eerste dag
            if (i == 0) {
                d = rows[0];
            }
            // Als de index het laatste element is (of hoger vanwege marges), laat dan de laatste dag zien
            else if (i >= (rows.length - 1)) {
                d = rows[rows.length - 1];
            }
            // Anders (dus dagen ertussen in)
            else {
                // Zoek de twee waarden rond de cursor
                var d0 = rows[i - 1], d1 = rows[i];

                // Bepaal welke van de twee waarden dichter bij de cursor ligt
                d = x0 - d0.avg > d1.avg - x0 ? d1 : d0;
            }

            // Bepaal de x- en y-coordinaat van de crosshair
            var chX = x(d.date), chY = y(d.avg);

            // Verticale component van de crosshair tekenen
            focus.select("#crosshairY")
                .attr("x1", chX)
                .attr("x2", chX)
                .attr("y1", 0)
                .attr("y2", height);
            // Horizontale component van de crosshair tekenen
            focus.select("#crosshairX")
                .attr("x1", 0)
                .attr("x2", width)
                .attr("y1", chY)
                .attr("y2", chY);

            // Laat de datum en gemiddelde temperatuur van die dag zien als een tooltip naast de crosshair
            focus.select("text")
                .attr("x", chX + 5)
                .attr("y", chY)
                .attr("dy", "-.35em")
                .text(d.date.getFullYear() + "/" + (d.date.getMonth() + 1) + "/" + d.date.getDate() + ": " + d.avg + "C");
        }

});
