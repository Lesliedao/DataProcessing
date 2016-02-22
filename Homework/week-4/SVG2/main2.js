/* use this to test out your function */
window.onload = function() {
    // Verander Frankrijk naar geel
 	changeColor("fr", "#F0FF00");
    // Verander Italie naar groen
    changeColor("it", "#00AE0C");
    // Verander Griekenland naar paars
    changeColor("gr", "#AE009E");
    // Verander Oostenrijk naar roze
    changeColor("at", "#FF82FA");
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