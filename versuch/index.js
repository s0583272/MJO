import methodOverride from 'method-override';
import express from 'express';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAllProdukte, getProdukteCount, changeprodukte,getKategorieMitSpielAnzahl, getProduktById, getProductByIdLOL, createProduct, updateProduct, deleteProduct, getProdukteByPriceRangeAndName, addToWarenkorb, registerUser, loginUser,getAllKategorien} from './database.js';
//import { sanitizeArray, sanitizeString } from './utils/sanitize.js';


// Configuration
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;


// Middleware
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(express.json());


// Neue Route für die Üersichtsseite
app.get('/', (req, res) => {
    res.render('Übersichtsseite');
});

// Route für Registrierung
app.post('/register', async (req, res) => {
    const { email, username, password } = req.body;
    console.log('Registrierungsdaten:', { email, username, password });
    if (!email || !username || !password) {
        return res.status(400).send('Alle Felder sind erforderlich.');
    }
    const result = await registerUser(email, username, password);
    console.log('Registrierungsergebnis:', result);
    if (result.error) {
        return res.status(400).send(result.error);
    }
    res.status(200).send(result.message);
});
// Route zum Bearbeiten einer Kategorie
app.post('/categories/:id/edit', async (req, res) => {
    const categoryId = parseInt(req.params.id, 10); // Kategorie-ID aus der URL
    const { neuerName } = req.body; // Neuer Name aus dem Formular

    // Validierung der Eingabedaten
    if (isNaN(categoryId) || !neuerName || neuerName.trim() === '') {
        return res.status(400).send('Ungültige Eingabedaten. Bitte gib einen gültigen Kategorienamen ein.');
    }

    try {
        // Aufruf der Backend-Funktion zur Aktualisierung
        await updateCategoryAndProducts(categoryId, neuerName.trim());

        // Weiterleitung zur Kategorienübersicht
        res.redirect('/categories');
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Kategorie:', error);
        res.status(500).send('Fehler beim Aktualisieren der Kategorie.');
    }
});
// Route für Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Benutzername und Passwort sind erforderlich.');
    }
    const result = await loginUser(username, password);
    if (result.error) {
        return res.status(400).send(result.error);
    }
    res.status(200).send(result.message);
});

// Neue Route für die Impressum-Seite
app.get('/impressum', (req, res) => {
    res.render('Impressum');
});

// Neue Route für die Kategorien-Seite
app.get('/categories', async (req, res) => {
    try {
        const kategorienMitAnzahl = await getKategorieMitSpielAnzahl();  // Ruft die Kategorien und die Anzahl der Spiele ab
        res.render('Category', { kategorien: kategorienMitAnzahl });  // Übergibt die Daten an die Category.ejs
    } catch (error) {
        console.error('Fehler beim Laden der Kategorien:', error);
        res.status(500).send('Fehler beim Laden der Kategorien');
    }
});

// Neue Route für die OnlineShop-Seite
app.get('/onlineshop', async (req, res) => {
    try {
        const { minPreis, maxPreis, searchName } = req.query;

        let produkte = [];
        if (searchName) {
            produkte = await getProdukteByPriceRangeAndName(0, Number.MAX_SAFE_INTEGER, searchName);
        } else if (minPreis || maxPreis) {
            const min = minPreis ? parseFloat(minPreis) : 0;
            const max = maxPreis ? parseFloat(maxPreis) : Number.MAX_SAFE_INTEGER;
            produkte = await getProdukteByPriceRangeAndName(min, max, '');
        } else {
            produkte = await getAllProdukte();
        }

        res.render('OnlineShop', { produkte });
    } catch (error) {
        console.error('Error loading products:', error);
        res.status(500).send('Fehler beim Laden der Produkte');
    }
});

// Neue Route für die Warenkorb-seite
app.get('/warenkorb', (req, res) => {
    res.render('Warenkorb');
});
app.post('/createCategory', async (req, res) => {
    const { kategorieName } = req.body;  // Name der neuen Kategorie aus dem Formular

    if (!kategorieName) {
        return res.status(400).send('Category name is required');
    }

    try {
        // Füge die neue Kategorie zur Datenbank hinzu (z.B. INSERT-Query)
        const query = 'INSERT INTO Kategorien (name) VALUES (?)';
        await db.execute(query, [kategorieName]);
        res.redirect('/categories');  // Nach erfolgreichem Hinzufügen zurück zur Kategorie-Seite
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).send('Fehler beim Erstellen der Kategorie');
    }
});

// versuch/index.js
app.post('/add-to-cart', async (req, res) => {
    const { produktId, menge } = req.body;
    try {
        const result = await addToWarenkorb(produktId, menge);
        if (result.error) {
            return res.status(400).json(result);
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Hinzufügen des Produkts zum Warenkorb' });
    }
});

// Neue Route für die Warenkorb-seite
app.get('/Kontaktformular', (req, res) => {
    res.render('Kontaktformular');
});
// Neue Route für die Warenkorb-seite
app.get('/Create', (req, res) => {
    res.render('Create');
});
app.get('/Detailsseite', (req, res) => {
    res.render('Detailsseite');
});
app.get('/Detailsseite/:id', async (req, res) => {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
        return res.status(400).send('Ungültige Produkt-ID');
    }

    const produkt = await getProduktById(productId); // Produkt abrufen
    if (!produkt) {
        return res.status(404).send('Produkt nicht gefunden');
    }

    res.render('Detailsseite', { produkt }); // Daten an die EJS-Detailseite übergeben
});

app.get('/product', async (req, res) => {
    const productId2 = parseInt(req.query.id, 10);
    if (isNaN(productId2) || !isFinite(productId2)) {
        return res.status(400).json({ error: 'Invalid product ID' });
    }
    const produkt2 = await getProductByIdLOL(productId2);
    if (produkt2) {
        res.render('bearbeitung', { produkt2 });
    } else {
        res.render('bearbeitung', { produkt2: null });
    }
});

app.get('/product/:id', async (req, res) => {
    const productId2 = parseInt(req.params.id, 10);
    if (isNaN(productId2) || !isFinite(productId2)) {
        return res.status(400).json({ error: 'Invalid product ID' });
    }
    const produkt2 = await getProductByIdLOL(productId2);
    if (produkt2) {
        res.render('bearbeitung', { produkt2 });
    } else {
        res.render('bearbeitung', { produkt2: null });
    }
});

app.post('/product/:id', async (req, res) => {
    const { bezeichnung, preis, menge, bilder, beschreibung, kategorie } = req.body;
    const id = parseInt(req.params.id, 10);
    // Validierung der Eingabedaten
    if (!bezeichnung || isNaN(preis) || isNaN(menge)) {
        return res.status(400).send('1 Ungültige Eingabedaten');
    }

    // Produkt erstellen
    try {
        const result = await updateProduct(id,{
            bezeichnung,
            preis: parseFloat(preis),
            menge: parseInt(menge, 10),
            bilder,
            beschreibung,
            kategorie
        });
        if (result?.error) {
            return res.status(500).send(result.error);
        }

        // Weiterleitung oder Bestätigung
        res.redirect('/onlineshop'); // Weiterleitung zur Produktübersicht
    } catch (error) {
        console.error("Fehler beim Erstellen des Produkts:", error);
        res.status(500).send('Fehler beim Erstellen des Produkts');
    }
});

app.post('/product', async (req, res) => {
    try {
        const { bezeichnung, preis, menge, bilder, beschreibung, kategorie } = req.body;

        if (!bezeichnung || isNaN(preis) || isNaN(menge) || !kategorie) {
            return res.status(400).send('Ungültige Eingabedaten');
        }

        const newProduct = {
            bezeichnung,
            preis: parseFloat(preis),
            menge: parseInt(menge, 10),
            bilder: bilder || '',
            beschreibung: beschreibung || '',
            kategorie
        };

        const result = await createProduct(newProduct);
        console.log(result);

        if (result.error) {
            return res.status(500).send(result.error);
        }

        res.redirect('/onlineshop?success=true');
    } catch (error) {
        console.error(error);
        res.status(500).send('Interner Serverfehler');
    }
});

// Neue Route zum Löschen eines Produkts
app.delete('/product/:id', async (req, res) => {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
        return res.status(400).json({ error: '3 Ungültige Produkt-ID' });
    }

    try {
        const result = await deleteProduct(productId);
        if (result.error) {
            return res.status(404).json(result);
        }
        res.redirect('/onlineshop');
    } catch (error) {
        console.error('Fehler beim Löschen des Produkts:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

app.post('/update-category', async (req, res) => {
    const { oldCategoryName, newCategoryName } = req.body;

    if (!oldCategoryName || !newCategoryName) {
        return res.status(400).send('Both old and new category names are required.');
    }

    try {
        await updateCategoryForProducts(oldCategoryName, newCategoryName);
        res.redirect('/categories');
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).send('Error updating category');
    }
});

// Add this at the end of your route definitions
app.use((req, res, next) => {
    res.status(404).send('404: NOT_FOUND');
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


