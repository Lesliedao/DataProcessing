/*
/ D3 Line Extended
/ Leslie Dao
/ 10561234
/
/ Maakt een lijngrafiek met de gemiddelde dagtemperatuur in Rotterdam (in graden Celsius),
/ en daarbij ook de minimum en maximum dagtemperatuur.
/
/ Voorbeeldbron 1: http://bl.ocks.org/mbostock/3884955
/ Voorbeeldbron 2: http://jsfiddle.net/5JRMt/125/
/ Voorbeeldbron 3: http://bl.ocks.org/d3noob/7030f35b72de721622b8
/ Databron: http://projects.knmi.nl/klimatologie/daggegevens/selectie.cgi
*/

// Afmetingen van de chart
var margin = {top: 20, bottom: 60, right: 130, left: 50};
var width = 1200 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

// De data in de data van het KNMI hebben de volgende format
var dateFormat = d3.time.format("%Y%m%d");
// Bisect functie die gebruikt wordt bij het vinden van de dichtstbijzijnde waarde voor de tooltip
var bisectDate = d3.bisector(function(d) {return d.date;}).left;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");

svg.append("g")
    .attr("class", "y axis")
    // Een naam aan de y-as hangen
    .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 3)
        .attr("dy", ".75em")
        .style("text-anchor", "end")
        .text("Temperatuur in graden Celsius");

// Schalen en assen definieren
var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

// Kleurenschaal geimporteerd uit colorbrewer.js
var color = d3.scale.ordinal()
    .range(colorbrewer.Set1[3].reverse());

// Ticks voor elke maand
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(12);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

// De lijn neemt de datum als x- en de temperatuur als y-coordinaat
var line = d3.svg.line()
    .x(function(d) {return x(d.date);})
    .y(function(d) {return y(d.temp);})

// Laad de data in vanuit een csv bestand
d3.csv("data.csv", function(error, rows) {
    // Pak een willekeurig element om de keys uit te filteren die niet de datum zijn voor een ordinal scale
    color.domain(d3.keys(rows[0]).filter(function(key) {return key !== "date";}));

    // Maak van een js date voor elk datapunt
    rows.forEach(function(d) {
        d.date = new Date(dateFormat.parse(d.date) - new Date().getTimezoneOffset() * 60 * 1000);
    });

    // Initiele visualisatie
    var dataShown = rows.filter(function(d) {return d.date.getFullYear() == eval(d3.select("#dropdown").property("value"));});
    initialChart(dataShown);

    // Update de dataset adhv de gekozen optie in het dropdown menu
    d3.select("#dropdown")
        .on("change", function() {
            dataShown = rows.filter(function(d) {return d.date.getFullYear() == eval(d3.select("#dropdown").property("value"));});
            updateChart(dataShown);
        });

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
        .on("mousemove", function() {
            // 0e element is de x-coordinaat
            var x0 = x.invert(d3.mouse(this)[0]);

            // Zoek de index bij x0
            var i = bisectDate(dataShown, x0);

            // Placeholder voor de datum waarvoor de tooltip verschijnt
            var d;
            // Als de index 0 is, laat dan informatie zien van de eerste dag
            if (i == 0) {
                d = dataShown[0];
            }
            // Als de index het laatste element is (of hoger vanwege marges), laat dan de laatste dag zien
            else if (i >= (dataShown.length - 1)) {
                d = dataShown[dataShown.length - 1];
            }
            // Anders (dus dagen ertussen in)
            else {
                // Zoek de twee waarden rond de cursor
                var d0 = dataShown[i - 1], d1 = dataShown[i];

                // Bepaal welke van de twee waarden dichter bij de cursor ligt
                d = x0 - d0.date > d1.date - x0 ? d1 : d0;
            }

            // Bepaal de x- en y-coordinaat van de crosshair
            var chX = x(d.date)
            var chY;
            // Een d3.select() werkt niet om te checken welke button is geselecteerd
            if (document.getElementById("chMin").checked) {
                chY = y(d.Min / 10);
            }
            else if (document.getElementById("chGem").checked) {
                chY = y(d.Gem / 10);
            }
            else {
                chY = y(d.Max / 10);
            }

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

            // Laat de datum en geselecteerde temperatuur van die dag zien als een tooltip naast de crosshair
            focus.select("text")
                .attr("x", chX + 5)
                .attr("y", chY)
                .attr("dy", "-.35em")
                .text(function() {
                    var degrees;
                    if (document.getElementById("chMin").checked) {
                        degrees = d.Min;
                    }
                    else if (document.getElementById("chGem").checked) {
                        degrees = d.Gem;
                    }
                    else {
                        degrees = d.Max;
                    }
                    return d.date.getFullYear() + "/" + (d.date.getMonth() + 1) + "/" + d.date.getDate() + ": " + degrees / 10 + "C";
                });
        }
);
});

// Functie die wordt aangeroepen om de eerste lijnen te tekenen (als de pagina geladen wordt)
function initialChart(newData) {
    // Maak een array met objecten voor de temperaturen
    // 0: Gem, 1: Min, 2: Max
    var temps = color.domain().map(function(name) {
        return {
            type: name,
            values: newData.map(function(d) {
                return {date: d.date, temp: +d[name] / 10};
            })
        };
    });

    // Extent bepaalt het minimum en het maximum. Nice zorgt voor mooiere afkapwaarden.
    x.domain(d3.extent(newData, function(d) {return d.date;})).nice();

    // Het domein van y hangt nu af van drie mogelijke datasets die genest zijn in objecten
    y.domain([
        d3.min(temps, function(t) {return d3.min(t.values, function(v) {return v.temp;});}),
        d3.max(temps, function(t) {return d3.max(t.values, function(v) {return v.temp;});})
    ]).nice();

    // De assen tekenen
    svg.select(".x.axis")
        .transition()
            .duration(1000)
            .call(xAxis);

    svg.select(".y.axis")
        .transition()
            .duration(1000)
            .call(yAxis);

    // De data binden
    var temp = svg.selectAll(".temp")
        .data(temps);

    temp.enter().append("g")
        .attr("class", "temp");

    temp.append("path")
        .attr("class", "line")
        .attr("d", function(d) {return line(d.values);})
        .style("stroke", function(d) {return color(d.type);});

    temp.append("text")
        .datum(function(d) {return {type: d.type, value: d.values[d.values.length - 1]};})
        .attr("x", function(d) {return x(d.value.date) + 3;})
        .attr("y", function(d) {return y(d.value.temp);})
        .attr("dy", ".35em")
        .text(function(d) {return d.type;});
}

// De functie die wordt aangeroepen om de lijnen te updaten (bij het kiezen uit de dropdown)
function updateChart(newData) {
    // Maak een array met objecten voor de temperaturen
    // 0: Gem, 1: Min, 2: Max
    var temps = color.domain().map(function(name) {
        return {
            type: name,
            values: newData.map(function(d) {
                return {date: d.date, temp: +d[name] / 10};
            })
        };
    });

    // Extent bepaalt het minimum en het maximum. Nice zorgt voor mooiere afkapwaarden.
    x.domain(d3.extent(newData, function(d) {return d.date;})).nice();

    // Het domein van y hangt nu af van drie mogelijke datasets die genest zijn in objecten
    y.domain([
        d3.min(temps, function(t) {return d3.min(t.values, function(v) {return v.temp;});}),
        d3.max(temps, function(t) {return d3.max(t.values, function(v) {return v.temp;});})
    ]).nice();

    // De assen tekenen
    svg.select(".x.axis")
        .transition()
            .duration(1000)
            .call(xAxis);

    svg.select(".y.axis")
        .transition()
            .duration(1000)
            .call(yAxis);

    // De data binden
    var temp = svg.selectAll(".temp")
        .data(temps);

    temp.enter().append("g")
        .attr("class", "temp");

    temp.select("path")
        .transition()
            .duration(1000)
            .ease("bounce")
            .attr("d", function(d) {return line(d.values);});

    temp.select("text")
        .datum(function(d) {return {type: d.type, value: d.values[d.values.length - 1]};})
        .transition()
            .duration(1000)
                .attr("x", function(d) {return x(d.value.date) + 3;})
                .attr("y", function(d) {return y(d.value.temp);});

    temp.exit().remove();
}
