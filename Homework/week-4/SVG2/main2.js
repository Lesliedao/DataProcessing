/* use this to test out your function */
window.onload = function() {
    
    var rawdata = document.getElementById("JSON");
    var dataObject = JSON.parse(rawdata.value);
    
    var range1 = "#EDF8E9", range2 = "#BAE4B3", range3 = "#74C476", range4 = "#31A354", range5 = "#006D2C";
    for (var i = 0; i < dataObject['points'].length; i++)
    {
        var code = countryCode(dataObject['points'][i][0]);
        if (code != 'xxx')
        {
            var selector = document.getElementById(code);
            if (selector !== null)
            {
                var percentage = Number(dataObject['points'][i][1].replace(/,/g, '.'));
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
    //document.getElementsByClassName("gb")[1].style.fill = range1;
}

/* changeColor takes a path ID and a color (hex value)
   and changes that path's fill color */
function changeColor(id, color) {
    /*
    / Leslie Dao
    / 10561234
    /
    / Een functie die de kleur van een land verandert in javascript.
    / Bron: http://www.w3schools.com/js/js_htmldom_css.asp
    */
        document.getElementById(id).style.fill = color;
}

function countryCode(country)
{
    // Placeholder
    var code = 'xxx';
    for (var i = 0; i < country_codes.length; i++)
    {
        if (country.toLowerCase() == country_codes[i][2].toLowerCase())
        {
            code = country_codes[i][0];
            break;
        }
    }
    
    return code;
}