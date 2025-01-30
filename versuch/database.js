import { randomUUID } from 'node:crypto';
import { createClient } from '@libsql/client';
import crypto from 'node:crypto';

const db = createClient({
    url: process.env.DB_HOST,
    authToken: process.env.API_KEY,
});

export const initDb = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS Produkte (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bezeichnung TEXT NOT NULL,
            menge INTEGER NOT NULL,
            preis REAL NOT NULL,
            kategorie TEXT NOT NULL,
            bilder TEXT NOT NULL,
            beschreibung TEXT NOT NULL,
            kategorie TEXT NOT NULL
        )
    `);

    await db.execute(`
        CREATE TABLE IF NOT EXISTS Warenkorb (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            produktId INTEGER NOT NULL,
            menge INTEGER NOT NULL,
            FOREIGN KEY (produktId) REFERENCES Produkte(id)
        )
    `);

    await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    `);
};

import bcrypt from 'bcrypt';

export async function registerUser(email, username, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await db.execute(
            `INSERT INTO users (email, username, password) VALUES (?, ?, ?)`,
            [email, username, hashedPassword]
        );
        return { message: 'Registration successful' };
    } catch (error) {
        console.error('Error registering user:', error);
        return { error: 'Registration failed. Email or username might already exist.' };
    }
}

export async function loginUser(username, password) {
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    try {
        const result = await db.execute(
            `SELECT * FROM users WHERE username = ? AND password = ?`,
            [username, hashedPassword]
        );
        if (result.rows.length > 0) {
            return { message: 'Login successful', user: result.rows[0] };
        } else {
            return { error: 'Invalid username or password' };
        }
    } catch (error) {
        console.error('Error logging in user:', error);
        return { error: 'Login failed' };
    }
}
export async function getProdukteCount() {
    const result = await db.execute('SELECT COUNT(*) as count FROM Produkte');
    return result.rows[0].count;
}

export async function getAllProdukte() {
    const result = await db.execute('SELECT id, menge, preis, bezeichnung, bilder FROM Produkte');
    return result.rows;
}
export async function changeprodukte(id, newBezeichnung, newPreis, newMenge) {
    const query = `
        UPDATE Produkte
        SET bezeichnung = ?, preis = ?, menge = ?
        WHERE id = ?
    `;
    const params = [newBezeichnung, newPreis, newMenge, id];
    await db.execute(query, params);
}

export async function getProduktById(id) {
    try {
        const response = await db.execute("SELECT * FROM Produkte WHERE id = ?", [id]);
        if (response.rows.length > 0) {
            return response.rows[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}

export async function getProductByIdLOL(productId) {
    try {
        const response = await db.execute("SELECT * FROM Produkte WHERE id = ?", [productId]);
        if (response.rows.length > 0) {
            return response.rows[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error("Fehler beim Abrufen des Produkts:", error);
        return null;
    }
}

export async function createProduct(data) {
    const { bezeichnung, preis, menge, bilder, beschreibung, kategorie } = data;

    if (typeof bezeichnung !== 'string' || typeof preis !== 'number' || typeof menge !== 'number' || typeof kategorie !== 'string') {
        return { error: 'Ungültige Produktdaten' };
    }

    try {
        await db.execute(
            "INSERT INTO Produkte (bezeichnung, preis, menge, bilder, beschreibung, kategorie) VALUES (?, ?, ?, ?, ?, ?)",
            [bezeichnung.trim(), preis, menge, bilder || '', beschreibung || '', kategorie]
        );
        return { message: 'Produkt erstellt' };
    } catch (error) {
        console.error("Fehler beim Erstellen des Produkts:", error);
        return { error: 'Fehler beim Erstellen des Produkts' };
    }
}
export async function updateCategoryAndProducts(categoryId, neuerName) {
    // Validierung: Neuer Name darf nicht leer sein
    if (!neuerName || neuerName.trim() === '') {
        throw new Error('Ungültiger neuer Kategoriename.');
    }

    try {
        // Aktualisierung des Kategorienamens in der Tabelle "Kategorien"
        const queryCategory = `
            UPDATE Kategorien
            SET name = ?
            WHERE id = ?
        `;
        await db.execute(queryCategory, [neuerName.trim(), categoryId]);

        // Aktualisierung der Kategorie in der Tabelle "Produkte"
        const queryProducts = `
            UPDATE Produkte
            SET kategorie = ?
            WHERE kategorie = (
                SELECT name FROM Kategorien WHERE id = ?
            )
        `;
        await db.execute(queryProducts, [neuerName.trim(), categoryId]);

        console.log(`Kategorie mit ID ${categoryId} erfolgreich aktualisiert.`);
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Kategorie:', error);
        throw error;
    }
}


export async function updateProduct(id, { bezeichnung, preis, menge, bilder, beschreibung, kategorie }) {
    beschreibung = beschreibung || '';

    const currentProduct = await getProduktById(id);
    if (!currentProduct) {
        throw new Error('Produkt nicht gefunden');
    }
    bilder = bilder !== undefined ? bilder : currentProduct.bilder;

    console.log('Updating product with values:', { id, bezeichnung, preis, menge, bilder, beschreibung, kategorie });

    const query = `
        UPDATE Produkte
        SET bezeichnung = ?, preis = ?, menge = ?, bilder = ?, beschreibung = ?, kategorie = ?
        WHERE id = ?
    `;
    const params = [bezeichnung, parseFloat(preis), parseInt(menge, 10), bilder, beschreibung, kategorie, id];

    console.log('Parameters:', params);

    try {
        await db.execute(query, params);
    } catch (error) {
        console.error('Error executing query:', error);
        throw error;
    }
}

export async function deleteProduct(productId) {
    try {
        const result = await db.execute("DELETE FROM Produkte WHERE id = ?", [productId]);
        if (result.affectedRows === 0) {
            return { error: 'Produkt nicht gefunden' };
        }
        return { message: 'Produkt gelöscht' };
    } catch (error) {
        console.error("Fehler beim Löschen des Produkts:", error);
        return { error: 'Fehler beim Löschen des Produkts' };
    }
}
// Funktion, um die Anzahl der Produkte pro Kategorie zu erhalten
export async function getKategorieMitSpielAnzahl() {
    try {
        const query = `
            SELECT kategorie, COUNT(*) as spieleAnzahl
            FROM Produkte
            GROUP BY kategorie
            ORDER BY kategorie ASC
        `;
        const result = await db.execute(query);
        return result.rows; // Gibt die Kategorien mit der Anzahl der Spiele zurück
    } catch (error) {
        console.error('Fehler beim Abrufen der Kategorien mit Spieleanzahl:', error);
        throw error;
    }
}

export async function getProdukteByPriceRangeAndName(minPreis, maxPreis, name) {

    let query = `
        SELECT * FROM Produkte
        WHERE preis BETWEEN ? AND ?
    `;
    const params = [minPreis, maxPreis];

    if (name) {
        query += ` AND bezeichnung LIKE ?`;
        params.push(`%${name}%`);
    }

    query += ` ORDER BY preis ASC`;

    console.log('Executing query:', query);
    console.log('With parameters:', params);

    try {
        const result = await db.execute(query, params);
        console.log('Query result:', result.rows || result);
        return result.rows; // Or result[0], depending on the library
    } catch (error) {
        console.error('Error fetching products by price range and name:', error);
        throw error;
    }
}
export async function getAllKategorien() {
    try {
        const query = `SELECT DISTINCT kategorie FROM Produkte ORDER BY kategorie ASC`;  // Hole alle Kategorien aus der Produktetabelle
        const result = await db.execute(query);
        return result.rows.map(row => row.kategorie);  // Passen Sie dies je nach DB-Bibliothek an
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
}
// versuch/database.js
export async function addToWarenkorb(produktId, menge) {
    try {
        const product = await getProduktById(produktId);
        if (!product) {
            return { error: 'Produkt nicht gefunden' };
        }

        const { bezeichnung, preis } = product;

        await db.execute(
            "INSERT INTO Warenkorb (produktId, bezeichnung, preis, menge) VALUES (?, ?, ?, ?)",
            [produktId, bezeichnung, preis, menge]
        );
        return { message: 'Produkt zum Warenkorb hinzugefügt' };
    } catch (error) {
        console.error("Fehler beim Hinzufügen des Produkts zum Warenkorb:", error);
        return { error: 'Fehler beim Hinzufügen des Produkts zum Warenkorb' };
    }
}

export async function updateCategoryForProducts(oldCategoryName, newCategoryName) {
    if (!oldCategoryName || !newCategoryName) {
        throw new Error('Both old and new category names are required.');
    }

    try {
        const query = `
            UPDATE Produkte
            SET kategorie = ?
            WHERE kategorie = ?
        `;
        await db.execute(query, [newCategoryName, oldCategoryName]);
        console.log(`Kategorie von ${oldCategoryName} zu ${newCategoryName} erfolgreich aktualisiert.`);
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Kategorie:', error);
        throw error;
    }
}



