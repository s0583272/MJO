const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db'); // Datenbankverbindung (siehe unten)
const app = express();
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Die definierten Routen (editCategory, deleteCategory, addCategory) müssen registriert werden:
app.post('/api/editCategory', async (req, res) => { /* ... */ });
app.post('/api/deleteCategory', async (req, res) => { /* ... */ });
app.post('/api/addCategory', async (req, res) => { /* ... */ });

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.post('/api/editCategory', async (req, res) => {
    const { id, newName } = req.body;
    if (!id || !newName) {
        return res.status(400).send({ message: 'Missing id or newName' });
    }
    try {
        const result = await db.query(
            'UPDATE categories SET name = ? WHERE category_id = ?',
            [newName, id]
        );
        res.status(200).send({ message: 'Category updated successfully' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send({ message: 'Error updating category' });
    }
});
app.post('/api/deleteCategory', async (req, res) => {
    const { id } = req.body;
    try {
        const result = await db.query(
            'DELETE FROM categories WHERE category_id = ?',
            [id]
        );
        res.status(200).send({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error deleting category' });
    }
});
app.post('/api/addCategory', async (req, res) => {
    const { name } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO categories (name) VALUES (?)',
            [name]
        );
        res.status(200).send({ message: 'Category added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error adding category' });
    }
});
app.get('/api/getCategories', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categories');
        res.status(200).send(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error fetching categories' });
    }
});
