
function toggleDropdown() {
    document.getElementById("myDropdown").classList.toggle("show");
}
// Schließe das Dropdown, wenn der Benutzer außerhalb klickt
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}
// zurück Knopf
function goBack() {
    window.history.back();
}





