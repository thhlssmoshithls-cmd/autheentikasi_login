const express = require('express');
const app = express();
const port = 3200;

app.use(express.json());


let movies = [
    { id: 1, title: 'Inception', director: 'Christopher Nolan', releaseYear: 2010 },
    { id: 2, title: 'The Matrix', director: 'Lana Wachowski', releaseYear: 1999 },
    { id: 3, title: 'Parasite', director: 'Bong Joon-ho', releaseYear: 2019 }
];
let movieIdCounter = movies.length + 1;

let directors = [
    { id: 1, name: 'Christopher Nolan', birthYear: 1970 },
    { id: 2, name: 'Steven Spielberg', birthYear: 1946 },
    { id: 3, name: 'Quentin Tarantino', birthYear: 1963 }
];
let directorIdCounter = directors.length + 1;

// --- API UNTUK MOVIES ---

// GET: Mendapatkan semua film
app.get('/movies', (req, res) => {
    res.json(movies);
});

// GET: Mendapatkan film berdasarkan ID
app.get('/movies/:id', (req, res) => {
    const movie = movies.find(m => m.id === parseInt(req.params.id));
    if (!movie) {
        return res.status(404).json({ message: 'Film tidak ditemukan.' });
    }
    res.json(movie);
});

// POST: Membuat film baru
app.post('/movies', (req, res) => {
    const { title, director, releaseYear } = req.body;
    if (!title || !director || !releaseYear) {
        return res.status(400).json({ message: 'Judul, sutradara, dan tahun rilis harus diisi.' });
    }
    const newMovie = {
        id: movieIdCounter++,
        title,
        director,
        releaseYear
    };
    movies.push(newMovie);
    res.status(201).json(newMovie);
});

// PUT: Memperbarui film
app.put('/movies/:id', (req, res) => {
    const movie = movies.find(m => m.id === parseInt(req.params.id));
    if (!movie) {
        return res.status(404).json({ message: 'Film tidak ditemukan.' });
    }
    const { title, director, releaseYear } = req.body;
    if (title) {
        movie.title = title;
    }
    if (director) {
        movie.director = director;
    }
    if (releaseYear) {
        movie.releaseYear = releaseYear;
    }
    res.json(movie);
});

// DELETE: Menghapus film
app.delete('/movies/:id', (req, res) => {
    const initialLength = movies.length;
    movies = movies.filter(m => m.id !== parseInt(req.params.id));
    if (movies.length === initialLength) {
        return res.status(404).json({ message: 'Film tidak ditemukan.' });
    }
    res.json({ message: 'Film berhasil dihapus.' });
});

// --- API UNTUK DIRECTORS (SUTRADARA) ---

// GET: Mendapatkan semua sutradara
app.get('/directors', (req, res) => {
    res.json(directors);
});

// GET: Mendapatkan sutradara berdasarkan ID
app.get('/directors/:id', (req, res) => {
    const director = directors.find(d => d.id === parseInt(req.params.id));
    if (!director) {
        return res.status(404).json({ message: 'Sutradara tidak ditemukan.' });
    }
    res.json(director);
});

// POST: Membuat sutradara baru
app.post('/directors', (req, res) => {
    const { name, birthYear } = req.body;
    if (!name || !birthYear) {
        return res.status(400).json({ message: 'Nama dan tahun lahir harus diisi.' });
    }
    const newDirector = {
        id: directorIdCounter++,
        name,
        birthYear
    };
    directors.push(newDirector);
    res.status(201).json(newDirector);
});

// PUT: Memperbarui sutradara
app.put('/directors/:id', (req, res) => {
    const director = directors.find(d => d.id === parseInt(req.params.id));
    if (!director) {
        return res.status(404).json({ message: 'Sutradara tidak ditemukan.' });
    }
    const { name, birthYear } = req.body;
    if (name) {
        director.name = name;
    }
    if (birthYear) {
        director.birthYear = birthYear;
    }
    res.json(director);
});

// DELETE: Menghapus sutradara
app.delete('/directors/:id', (req, res) => {
    const initialLength = directors.length;
    directors = directors.filter(d => d.id !== parseInt(req.params.id));
    if (directors.length === initialLength) {
        return res.status(404).json({ message: 'Sutradara tidak ditemukan.' });
    }
    res.json({ message: 'Sutradara berhasil dihapus.' });
});

// Menjalankan server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});