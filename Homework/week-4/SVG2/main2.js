/*
/ Leslie Dao
/ 10561234
/
/ Javascript bij svg2.html
/
/ Een functie die de kleur van een land verandert in javascript.
/ Bron: http://www.w3schools.com/js/js_htmldom_css.asp
*/

window.onload = function() {
    
    // Pak de JSON en maak er een object van
    var rawdata = document.getElementById("JSON");
    var dataObject = JSON.parse(rawdata.value);
    
    // Kleuren om de landen mee te fillen
    var range1 = "#EDF8E9", range2 = "#BAE4B3", range3 = "#74C476", range4 = "#31A354", range5 = "#006D2C";
    
    // Ga elk land in het object af
    for (var i = 0; i < dataObject['points'].length; i++)
    {
    	// Zoek de code van het land op (id)
        var code = countryCode(dataObject['points'][i][0]);
        // 'xxx' is een placeholder voor als het land niet gevonden is
        if (code != 'xxx')
        {
        	// Pak het element met de bijbehorende id van het land
            var selector = document.getElementById(code);
            // Als het land gevonden is (dus het ligt in europa)
            if (selector !== null)
            {
            	// Maak een decimaal getal van het datapunt
                var percentage = Number(dataObject['points'][i][1].replace(/,/g, '.'));
                
                // Fill het land met de bijhorende kleur
                var color;
                if (percentage < 20)
                    color = range1;
                else if (percentage < 40)
                    color = range2;
                else if (percentage < 60)
                    color = range3;
                else if (percentage < 80)
                    color = range4;
                else
                    color = range5;
                
                changeColor(code, color);
            }
        }
    }
    // Aanroepen van extra fills, indien nodig
    //document.getElementsByClassName("gb")[1].style.fill = range1;
}

/* 
/ changeColor takes a path ID and a color (hex value)
/ and changes that path's fill color 
/ Bron: http://www.w3schools.com/js/js_htmldom_css.asp
*/
function changeColor(id, color) {

	document.getElementById(id).style.fill = color;
}

/*
/ Functie die een land neemt als string (volle naam) en hem opzoekt in de database
/ in countries.js
/ Als het land gevonden is, returnt de functie de id van dat land.
/ Als het niet gevonden is, returnt de functie de placeholder 'xxx' om aan te geven
/ dat het land niet in de database voorkomt.
*/
function countryCode(country)
{
    // Placeholder waarde
    var code = 'xxx';
    
    // Itereer over de hele nested array in countries.js (database)
    for (var i = 0; i < country_codes.length; i++)
    {
    	// Vergelijk om te kijken of het land in countries.js voorkomt
        if (country.toLowerCase() == country_codes[i][2].toLowerCase())
        {
        	// Als gevonden, zet de code dan op de id van dat land
            code = country_codes[i][0];
            break;
        }
    }
    
    return code;
}