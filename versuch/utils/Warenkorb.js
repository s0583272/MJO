// Initiale Werte für Artikelanzahl und Gesamtpreis
let itemCount = 0;
let totalPrice = 0.00;

// Warenkorb laden und initialisieren
function loadCart() {
    const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
    itemCount = cartItems.length;
    totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);
    updateCartInfo();
    loadCartItems(); // Ruft die neue Funktion auf
}

// Funktion, um die Anzahl der Artikel und den Gesamtpreis zu aktualisieren
function updateCartInfo() {
    document.getElementById("item-count").textContent = itemCount;
    document.getElementById("total-price").textContent = totalPrice.toFixed(2) + " €";
}

// Funktion, um Artikel im Warenkorb anzuzeigen
function loadCartItems() {
    const cartContainer = document.getElementById("cart-items"); // Gehe sicher, dass dies die ID deines Containers ist
    const cartItems = JSON.parse(localStorage.getItem("cartItems")) || []; // Produkte aus dem Local Storage laden

    cartContainer.innerHTML = ""; // Vorherigen Inhalt löschen

    if (cartItems.length === 0) {
        cartContainer.innerHTML = "<p>Der Warenkorb ist leer.</p>";
    } else {
        cartItems.forEach((item, index) => {
            const productCard = document.createElement("div");
            productCard.className = "game-card"; // Style bleibt gleich wie im Shop

            productCard.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="game-image">
                <h2>${item.name}</h2>
                <p class="description">${item.description || "Keine Beschreibung verfügbar"}</p>
                <p class="price">${item.price.toFixed(2)} €</p>
                <button class="remove-from-cart" onclick="removeFromCart(${index})">Entfernen</button>
            `;
            cartContainer.appendChild(productCard);
        });
    }
}

// Funktion, um ein Spiel aus dem Warenkorb zu entfernen
function removeFromCart(index) {
    let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    const item = cartItems[index];

    // Artikelanzahl und Gesamtpreis aktualisieren
    itemCount -= 1;
    totalPrice -= item.price;

    // Artikel aus dem Array entfernen und Warenkorb aktualisieren
    cartItems.splice(index, 1);
    localStorage.setItem("cartItems", JSON.stringify(cartItems));

    // Zeigt die neuen Werte an und aktualisiert den Warenkorb
    updateCartInfo();
    loadCartItems();
}

// Funktion, um ein Spiel in den Warenkorb zu legen
function addToCart(button) {
    const card = button.closest(".game-card");
    const id = card.getAttribute("data-id");
    const name = card.querySelector("h2").innerText;
    const price = parseFloat(card.querySelector(".price").getAttribute("data-price"));
    const image = card.querySelector("img").src;

    // Erstelle das Artikelobjekt
    const item = { id, name, price, image };

    // Warenkorb aus dem localStorage laden und neuen Artikel hinzufügen
    let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    cartItems.push(item);
    localStorage.setItem("cartItems", JSON.stringify(cartItems));

    // Artikelanzahl und Gesamtpreis aktualisieren
    itemCount += 1;
    totalPrice += price;

    // Zeigt die neuen Werte an und aktualisiert den Warenkorb
    updateCartInfo();

    // Optional: Nachricht für den Benutzer
    alert(`${name} wurde zum Warenkorb hinzugefügt!`);
}

// Lade den Warenkorb beim Start
window.onload = loadCart;
