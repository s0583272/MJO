function goBack() {
    window.history.back();
}

function showCheckmark() {
    const checkmark = document.getElementById("checkmark");
    checkmark.style.display = checkmark.style.display === "inline" ? "none" : "inline";
}

// Modal öffnen
function openModal() {
    document.getElementById("review-modal").style.display = "flex";
}

// Modal schließen
function closeModal() {
    document.getElementById("review-modal").style.display = "none";
}

// Bewertung (Sterne) setzen
function setRating(rating) {
    const stars = document.querySelectorAll(".star-rating .star");
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add("selected");
        } else {
            star.classList.remove("selected");
        }
    });
}

// Review einreichen
function submitReview(event) {
    event.preventDefault();

    const nickname = document.getElementById("nickname").value;
    const headline = document.getElementById("headline").value;
    const reviewText = document.getElementById("review-text").value;
    const reviewsList = document.getElementById("reviews-list");

    const reviewItem = document.createElement("div");
    reviewItem.classList.add("review-item");

    reviewItem.innerHTML = `
            <h4>${headline}</h4>
            <p><strong>${nickname}:</strong> ${reviewText}</p>
        `;

    reviewsList.appendChild(reviewItem);

    closeModal();
    alert("Your review has been submitted!");
}

// Reviews anzeigen
function showReviews() {
    const reviewsList = document.getElementById("reviews-list");
    reviewsList.style.display = reviewsList.style.display === "none" ? "block" : "none";
}