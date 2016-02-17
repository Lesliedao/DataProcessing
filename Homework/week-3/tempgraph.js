/*
/ Leslie Dao
/ 10561234
/
/ Neemt de dagelijkse gemiddelde temperatuur van het jaar 2015 en plot een grafiek
/ Bron: http://projects.knmi.nl/klimatologie/daggegevens/selectie.cgi (KNMI)
/ Interactiviteit: crosshair die snapt op de grafiek en tooltip (delay 1 seconde)
*/

// Zoek in de DOM naar de id 'rawdata'
var rawData = document.getElementById("rawdata");
// Maak een array van de rawdata en maak van elke regel een element
var dataArray = rawData.value.split('\n');

// Lege arrays om de data en temperaturen apart in te appenden
var dates = [];
var avgTemps = [];
var days = [];

// Loop over de dataArray
for (var i = 0; i < dataArray.length; i++)
{
	// Maak een hulpvariabele aan die de datum en temperatuur splitst
	var aux = dataArray[i].split(',');
	//console.log(aux);
	// Maak van de string (element 0) een Javascript datum en verwijder de spaties
	var day = new Date(aux[0].replace(/ /g,''))
	// Zet de tijdzone offset terug en append aan de dates array
	dates.push(new Date(day.getTime() - day.getTimezoneOffset()*60000));
	// Houd een array van de dagnotatie bij voor de tooltip
	days.push(aux[0].replace(/ /g,''));
	
	// Maak van de string (element 1) een Javascript number en verwijder de spaties en append aan de avgTemps array
	avgTemps.push(Number(aux[1].replace(/ /g,'')));
}

function createTransform(domain, range)
{
	/* 
	/ domain is a two-element array of the data bounds [domain_min, domain_max]
	/ range is a two-element array of the screen bounds [range_min, range_max]
	/ This gives you two equations to solve:
	/ range_min = alpha * domain_min + beta
	/ range_max = alpha * domain_max + beta
	/ Implement your solution here:
	*/
	
	// Het stelsel vergelijkingen is als matrixvergelijking te schrijven
	// door deze vergelijking op te lossen, volgt
	var alpha = (range[0] - range[1]) / (domain[0] - domain[1]);
	var beta = (domain[0] * range[1] - domain[1] * range[0]) / (domain[0] - domain[1]);

	return function(x){
		return alpha * x + beta;
	};
}


// Voorwerk voor de grafiek
// Pak het canvas waar de grafiek op komt
var canvas = document.getElementById('graph');
var ctx = canvas.getContext('2d');

// Maak arrays aan voor de x- en y-coordinaten voor de grafiek
var xCoords = [];
var yCoords = [];

// Bereken hoeveel milliseconden er in een dag zijn
var msPerDay = dates[1].getTime() - dates[0].getTime();

// Bepaal de minimum en maximum temperatuur (gemiddeld)
var minTemp = Math.min.apply(Math, avgTemps);
var maxTemp = Math.max.apply(Math, avgTemps);

// Hulpvariabelen voor de offset van de grafiek en labels
var padding = 60;
var offset = 10;

// Maak transformfuncties aan voor x en y
var xTransform = createTransform([1, 365], [padding + offset, canvas.width]);
var yTransform = createTransform([minTemp, maxTemp], [0, canvas.height - padding - offset]);

// Bereken de getransformeerde x- (dag van het jaar) en y-coordinaten (gemiddelde temperatuur)
for (var i = 0; i < dates.length; i++)
{
	yCoords.push(canvas.height - padding - yTransform(avgTemps[i]));
	xCoords.push(xTransform((dates[i].getTime() - dates[0].getTime()) / msPerDay + 1));
}

// De kleur van de grafiek
ctx.strokeStyle = "#15FF00";

// Teken de grafiek (een continue lijn)
ctx.beginPath();
ctx.moveTo(xCoords[0], yCoords[0]);
for (var i = 1; i < xCoords.length; i++)
{
	ctx.lineTo(xCoords[i], yCoords[i]);
}
ctx.stroke();


// Zet de kleur weer op zwart voor de assen
ctx.strokeStyle = "#000000";

// Teken de y-as
ctx.beginPath();
ctx.moveTo(padding, 0);
ctx.lineTo(padding, canvas.height - padding);
ctx.stroke();

// Teken de x-as
ctx.beginPath();
ctx.moveTo(padding, canvas.height - padding);
ctx.lineTo(canvas.width, canvas.height - padding);
ctx.stroke();

// Voorwerk voor de x-as labels
ctx.fillStyle = "#444444";
ctx.font = "normal normal 11px Helvetica";

// Bepaal de eerste dag van de maand van elke maand (zero-indexed, geen schrikkeljaar) voor de x-coordinaat van de label
var firstDayOfTheMonth = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
// Hulparray om de labels te maken
var months = ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"];

for (var i = 0; i < months.length; i++)
{
	// Maak de korte hulplijnen aan de x-as
	ctx.beginPath();
	ctx.moveTo(xCoords[firstDayOfTheMonth[i]], canvas.height - padding);
	ctx.lineTo(xCoords[firstDayOfTheMonth[i]], canvas.height - padding + offset / 2);
	ctx.stroke();
	
	// Roteer het canvas zodat de maanden schuin langs de x-as komen te staan
	// Bewaar het niet-geroteerde canvas zodat je dat later kunt herstellen
	ctx.save();
	ctx.translate(xCoords[firstDayOfTheMonth[i]], canvas.height - padding + offset);
	ctx.rotate(-Math.PI / 4);
	ctx.textAlign = "right";
	ctx.fillText(months[i], 0, 0);
	// Herstel het canvas zodat het niet meer geroteerd is
	ctx.restore();
}

// y-as labels
ctx.font = "normal normal 14px Helvetica";
// Van -2 tm 26 graden in stappen van 2 zijn 15 labels
for (var i = 0; i < 15; i++)
{
	// Maak de korte hulplijnen aan de y-as
	ctx.beginPath();
	ctx.moveTo(padding, yTransform(-20 + 20 * i) - 2);
	ctx.lineTo(padding - offset / 2, yTransform(-20 + 20 * i) - 2);
	ctx.stroke();
	
	// Plaats de graden naast de y-as (niet roteren)
	ctx.textAlign = "right";
	ctx.fillText(-2 + 2 * i, padding - offset, canvas.height - padding - yTransform(-20 + 20 * i) + offset / 2);
}
// Label voor de gehele y-as
ctx.fillText("T(C)", padding / 2, padding / 4);

// INTERACTIVITEIT
// Pak het canvas waar de crosshair en tooltip op komen
var overCanvas = document.getElementById("overlay");
var ovc = overCanvas.getContext('2d');

// Voorwerk voor de crosshair en tooltip
// Stel de font in
ovc.font = "16px Helvetica";

// Bepaal de dimensies van het canvas (left, right, top, bottom, width, height)
var canvasDim = canvas.getBoundingClientRect();
// Maak de inverse transformatiefunctie voor x, om van canvascoordinaten naar dagen van het jaar te gaan
var dataX = createTransform([0, canvasDim.right - canvasDim.left - padding - offset], [1, 365]);

// Maak alvast een variabele aan voor de tooltip timer
var tooltipTimer;

// Dit is de callback als de muis over het canvas beweegt
function mousemove(event)
{
	// Verwijder de tooltip timer als deze ingesteld was
	clearTimeout(tooltipTimer);
	
	// Bereken de x-coordinaat van de cursor in het relevante deel (waar de data is)
	var crosshairX = event.clientX - canvasDim.left - padding - offset;
	
	// Maak alvast een index variabele aan
	var chX;
	// Als de cursor op het canvas zit, maar links van de grafiek, snap de crosshair dan op de eerste dag
	if (dataX(crosshairX) < 1)
	{
		chX = 1;
	}
	// anders snap de cursor op de dichtstbijzijnde dag
	else
	{
		chX = Math.round(dataX(crosshairX));
	}
	// Maak het canvas eerst leeg
	ovc.clearRect(0, 0, overCanvas.width, overCanvas.height);
	
	// Teken de verticale component van de crosshair
	ovc.beginPath();
	ovc.moveTo(xTransform(chX), overCanvas.height - padding);
	ovc.lineTo(xTransform(chX), 0);
	ovc.stroke();
	
	// Teken de horizontale component van de crosshair
	ovc.beginPath();
	ovc.moveTo(padding, overCanvas.height - padding - yTransform(avgTemps[chX - 1]));
	ovc.lineTo(overCanvas.width, overCanvas.height - padding - yTransform(avgTemps[chX - 1]));
	ovc.stroke();
	
	// Stel de timer in voor de tooltip
	tooltipTimer = setTimeout(drawTooltip, 1000, chX - 1, event.clientX, event.clientY);
}

// Verwijder de crosshair en tooltip als de muis niet over het canvas hovert
function mouseout()
{
	clearTimeout(tooltipTimer);
	ovc.clearRect(0, 0, overCanvas.width, overCanvas.height);
}

// Dit is de functie die de tooltip maakt. De tooltip verschijnt over het algemeen rechtsonder de cursor
function drawTooltip(i, x, y)
{
	// Achtergrondkleur van de tooltip
	ovc.fillStyle = "#FFFFFF";
	
	// Hulpvariabele voor als de tooltip door het canvas wordt afgesneden
	var offscreenOffset = 0;
	
	// x- en y-coordinaten voor de tooltipbox en de tooltipteksten
	var ttX, ttY, ttDateX, ttDateY, ttTempX, ttTempY;
	
	// Als de tooltip aan de rechterkant afgesneden wordt door het canvas, plaats hem dan linksonder de cursor
	if (x + offset + 100 >= canvasDim.right)
	{
		// Trial-and-error coordinaten voor de tooltipelementen
		// Tooltipbox
		ttX = x - canvasDim.left - 2 * padding;
		ttY = y - 2 * padding;
		// Datum in de tooltip
		ttDateX = x - canvasDim.left - 2 * padding + offset;
		ttDateY = y - 2 * padding + 1.5 * offset;
		// Temperatuur in de tooltip
		ttTempX = x - canvasDim.left - 2 * padding + offset;
		ttTempY = y - 2 * padding + 3 * offset
	}
	// plaats hem anders gewoon rechtsonder de cursor
	else
	{
		// Als de tooltip van onder afgesneden wordt door het canvas, schuif de tooltip dan iets omhoog
		// Dit is voor -deze- data alleen relevant waar de tooltip rechts van de cursor staat
		if (y + 35 >= canvasDim.bottom)
		{
			offscreenOffset = 40;
		}
		// Trial-and-error coordinaten voor de tooltipelementen
		// Tooltipbox
		ttX = x - canvasDim.left + offset;
		ttY = y - 2 * padding - offscreenOffset;
		// Datum in de tooltip
		ttDateX = x - canvasDim.left + 2 * offset;
		ttDateY = y - 2 * padding + 1.5 * offset - offscreenOffset;
		// Temperatuur in de tooltip
		ttTempX = x - canvasDim.left + 2 * offset;
		ttTempY = y - 2 * padding + 3 * offset - offscreenOffset;
	}
	// Maak de achtergrond van de tooltip
	ovc.beginPath();
	ovc.rect(ttX, ttY, 100, 35);
	ovc.fill();
	// Geef de tooltipbox een border
	ovc.lineWidth = 2;
	ovc.stroke();
	// Reset de lineWidth zodat de crosshair niet dikker wordt
	ovc.lineWidth = 1;
	
	// Plaats de tekst (datum en temperatuur) in de tooltipbox
	ovc.fillStyle = "#000000";
	ovc.fillText(days[i], ttDateX, ttDateY);
	ovc.fillText((avgTemps[i] / 10) + " graden", ttTempX, ttTempY);
}