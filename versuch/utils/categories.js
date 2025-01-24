async function loadCategories() {
    // Laden der OnlineShop.html
    const response = await fetch('OnlineShop.html');
    const htmlText = await response.text();

    // Erstellen eines DOM-Parsers, um die Daten auszulesen
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    // Alle Spiele mit Kategorien auslesen
    const games = doc.querySelectorAll('.game-card');
    const categories = {};

    games.forEach(game => {
        const category = game.getAttribute('data-category');
        if (!categories[category]) {
            categories[category] = 0;
        }
        categories[category]++;
    });

    // Tabelle mit den Kategorien und Spielanzahlen füllen
    const categoryTable = document.getElementById('categoryTable');
    let categoryId = 1;

    for (const [name, count] of Object.entries(categories)) {
        const row = `
                    <tr>
                        <td>${categoryId}</td>
                        <td>${name}</td>
                        <td>${count}</td>
                        <td><button onclick="editCategory(${categoryId})">Edit</button></td>
                        <td><button onclick="deleteCategory(${categoryId})">Delete</button></td>
                    </tr>
                `;
        categoryTable.innerHTML += row;
        categoryId++;
    }
}
// TODO mit SQL Befehle + Add new Kategorien
async function editCategory(id) {
    const newName = prompt('Enter the new name for category ID ' + id + ':');
    if (newName) {
        try {
            const response = await fetch('/api/editCategory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, newName })
            });

            if (response.ok) {
                alert('Category updated successfully!');
                location.reload();
            } else {
                alert('Failed to update category.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while updating the category.');
        }
    }
}

async function deleteCategory(id) {
    if (confirm('Are you sure you want to delete category ID ' + id + '?')) {
        try {
            const response = await fetch('/api/deleteCategory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            if (response.ok) {
                alert('Category deleted successfully!');
                location.reload();
            } else {
                alert('Failed to delete category.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while deleting the category.');
        }
    }
}
async function addCategory() {
    const categoryName = prompt('Enter the name of the new category:');
    if (categoryName) {
        try {
            const response = await fetch('/api/addCategory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: categoryName })
            });

            if (response.ok) {
                alert('Category added successfully!');
                location.reload();
            } else {
                alert('Failed to add category.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while adding the category.');
        }
    }
}



// Kategorien laden
loadCategories();