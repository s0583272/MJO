// Warenkorb Funktion
let itemCount = 0;
let totalPrice = 0.00;

// Funktion, um die Anzahl der Artikel und den Gesamtpreis zu aktualisieren
function updateCartInfo() {
    document.getElementById("item-count").textContent = itemCount;
    document.getElementById("total-price").textContent = totalPrice.toFixed(2) + " €";
}

// Funktion, um ein Spiel in den Warenkorb zu legen und die Informationen zu aktualisieren
function addToCart(button) {
    const card = button.closest(".game-card");
    const id = card.getAttribute("data-id");
    const name = card.querySelector("h2").innerText;
    const price = parseFloat(card.querySelector(".price").getAttribute("data-price"));
    const image = card.querySelector("img").src;

    // Erstelle das Artikelobjekt
    const item = { id, name, price, image };

    // Warenkorb aus dem localStorage laden und neuen Artikel hinzufügen
    let cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
    cartItems.push(item);
    localStorage.setItem("cartItems", JSON.stringify(cartItems));

    // Artikelanzahl und Gesamtpreis aktualisieren
    itemCount += 1;
    totalPrice += price;

    // Zeigt die neuen Werte an
    updateCartInfo();

    // Entferne das Spiel aus dem Shop-Bereich
    card.remove();
}

// Funktion zum Laden aller Spiele im Shop beim ersten Laden der Seite
function renderShopItems() {
    const shopContainer = document.getElementById("shop-items");
    shopContainer.innerHTML = "";

    // Alle `game-card`-Elemente anzeigen (angenommen, sie sind im HTML enthalten)
    document.querySelectorAll(".game-card").forEach(card => {
        const id = card.getAttribute("data-id");

        // Prüfen, ob das Spiel im Warenkorb ist und es nur anzeigen, wenn es noch nicht im Warenkorb ist
        const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
        if (!cartItems.some(item => item.id === id)) {
            shopContainer.appendChild(card);
        }
    });
}

// Beim Laden der Seite aufrufen, um die Shop-Artikel anzuzeigen und die Warenkorb-Infos zu aktualisieren
renderShopItems();
updateCartInfo();
function goBack() {
    window.history.back();
}
// Funktion für Dropdown-Menü
function toggleDropdown() {
    const dropdown = document.getElementById("myDropdown");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}
// function for Dropdown-Menü
function toggleCategoryDropdown() {
    const dropdown = document.getElementById("dropdown-content");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}
// Kategorien filter Funktion
function filterGames(category) {
    const games = document.querySelectorAll('.game-card');
    games.forEach(game => {
        if (category === 'all' || game.getAttribute('data-category') === category) {
            game.style.display = 'block';
        } else {
            game.style.display = 'none';
        }
    });
    // close the Dropdown
    toggleCategoryDropdown();
}
// Such Funktion
function searchGames() {
    const searchInput = document.getElementById("search-input").value.toLowerCase();
    const minPrice = parseFloat(document.getElementById("min-price").value) || 0;
    const maxPrice = parseFloat(document.getElementById("max-price").value) || Infinity;

    const gameCards = document.querySelectorAll(".game-card");
    gameCards.forEach(card => {
        const title = card.querySelector("h2").textContent.toLowerCase();
        const price = parseFloat(card.querySelector(".price").getAttribute("data-price"));

        // Filter basierend auf Titel und Preis
        if (
            (title.includes(searchInput) || !searchInput) &&
            price >= minPrice &&
            price <= maxPrice
        ) {
            card.style.display = "block"; // Anzeigen
        } else {
            card.style.display = "none"; // Ausblenden
        }
    });
}
function goToCart() {
    window.location.href = 'Warenkorb.html';
}
function deleteGame(button) {
    if (confirm("Möchtest du dieses Spiel wirklich löschen?")) {
        const gameCard = button.closest('.game-card');
        gameCard.remove();
    }
}
