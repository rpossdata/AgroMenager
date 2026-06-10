require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const { signToken, authenticateToken } = require('./auth');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Farm Management API',
            version: '1.0.0',
            description: 'API version with full Swagger documentation for all endpoints'
        },
        servers: [
            {
                url: `http://localhost:${PORT}`
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: [path.join(__dirname, 'index.js')]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const AUTH_USER = process.env.AUTH_USERNAME || 'admin';
const AUTH_PASS = process.env.AUTH_PASSWORD || 'admin';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Uwierzytelnianie JWT
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Logowanie i otrzymanie tokenu JWT
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token JWT
 *       401:
 *         description: Nieprawidłowe dane logowania
 */
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body || {};
    if (username !== AUTH_USER || password !== AUTH_PASS) {
        return res.status(401).json({ error: 'Nieprawidłowa nazwa użytkownika lub hasło' });
    }
    const token = signToken({ sub: username });
    res.json({
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    });
});

app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
        return next();
    }
    if (req.path === '/api/auth/login' && req.method === 'POST') {
        return next();
    }
    return authenticateToken(req, res, next);
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Aktualny użytkownik z tokenu JWT
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Nazwa użytkownika z pola sub tokenu
 *       401:
 *         description: Brak lub nieprawidłowy token
 */
app.get('/api/auth/me', (req, res) => {
    res.json({ username: req.user.sub });
});

// --- ROUTES ---

// 1. Animals (Zwierze)

/**
 * @swagger
 * tags:
 *   name: Animals
 *   description: API for managing animals
 */

/**
 * @swagger
 * /api/animals:
 *   get:
 *     summary: Retrieve a list of animals
 *     description: Retrieve all animals with their breed, species, and location names.
 *     tags: [Animals]
 *     responses:
 *       200:
 *         description: A list of animals.
 */
app.get('/api/animals', async (req, res) => {
    try {
        const query = `
      SELECT z.*, r.Nazwa_Rasy, g.Nazwa_Gatunku, l.Nazwa_Lokalizacji
      FROM Zwierze z
      LEFT JOIN Rasa r ON z.ID_Rasy = r.ID_Rasy
      LEFT JOIN Gatunek g ON r.ID_Gatunku = g.ID_Gatunku
      LEFT JOIN Lokalizacja l ON z.ID_Lokalizacji = l.ID_Lokalizacji
    `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/animals:
 *   post:
 *     summary: Add a new animal
 *     description: Create a new animal record.
 *     tags: [Animals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ID_Zwierzecia:
 *                 type: string
 *               ID_Rasy:
 *                 type: string
 *               ID_Lokalizacji:
 *                 type: string
 *               Data_Urodzenia:
 *                 type: string
 *                 format: date
 *               Plec:
 *                 type: string
 *               Status:
 *                 type: string
 *               ID_Matki:
 *                 type: string
 *               ID_Ojca:
 *                 type: string
 *     responses:
 *       200:
 *         description: Animal added successfully.
 */
app.post('/api/animals', async (req, res) => {
    try {
        const { ID_Zwierzecia, ID_Rasy, ID_Lokalizacji, Data_Urodzenia, Plec, Status, ID_Matki, ID_Ojca } = req.body;
        const query = `
      INSERT INTO Zwierze (ID_Zwierzecia, ID_Rasy, ID_Lokalizacji, Data_Urodzenia, Plec, Status, ID_Matki, ID_Ojca)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
        await db.query(query, [ID_Zwierzecia || uuidv4(), ID_Rasy, ID_Lokalizacji, Data_Urodzenia, Plec, Status, ID_Matki, ID_Ojca]);
        res.json({ message: 'Animal added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/animals/{id}:
 *   put:
 *     summary: Update an existing animal
 *     description: Modify animal data by ID.
 *     tags: [Animals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The animal ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ID_Rasy:
 *                 type: string
 *               ID_Lokalizacji:
 *                 type: string
 *               Data_Urodzenia:
 *                 type: string
 *                 format: date
 *               Plec:
 *                 type: string
 *               Status:
 *                 type: string
 *               ID_Matki:
 *                 type: string
 *               ID_Ojca:
 *                 type: string
 *     responses:
 *       200:
 *         description: Animal updated successfully.
 *       404:
 *         description: Animal not found.
 */
app.put('/api/animals/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { ID_Rasy, ID_Lokalizacji, Data_Urodzenia, Plec, Status, ID_Matki, ID_Ojca } = req.body;

        const query = `
            UPDATE Zwierze 
            SET ID_Rasy = $1, ID_Lokalizacji = $2, Data_Urodzenia = $3, Plec = $4, Status = $5, ID_Matki = $6, ID_Ojca = $7
            WHERE ID_Zwierzecia = $8
        `;

        const result = await db.query(query, [ID_Rasy, ID_Lokalizacji, Data_Urodzenia, Plec, Status, ID_Matki, ID_Ojca, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Animal not found' });
        }

        res.json({ message: 'Animal updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Dashboard Stats

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Statistics and dashboard info
 */

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Retrieve basic counts needed for main dashboard boxes.
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Dashboard stats containing animal counts, production, etc.
 */
app.get('/api/dashboard', async (req, res) => {
    try {
        const animalRes = await db.query('SELECT COUNT(*) as count FROM Zwierze');
        const lowFeedRes = await db.query('SELECT COUNT(*) as count FROM Pasza WHERE Stan_Magazynowy < 100');
        // date('now') works in sqlite, in postgres we use CURRENT_DATE
        const prodRes = await db.query("SELECT COUNT(*) as count FROM Produkcja WHERE DATE(Data_Produkcji) = CURRENT_DATE");

        res.json({
            animalCount: parseInt(animalRes.rows[0].count, 10),
            lowFeed: parseInt(lowFeedRes.rows[0].count, 10),
            productionToday: parseInt(prodRes.rows[0].count, 10)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 3. Employees (Pracownik)

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employees management
 */

app.get('/api/employees', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM Pracownik');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/employees', async (req, res) => {
    try {
        const { ID_Pracownika, Imie, Nazwisko, Stanowisko } = req.body;
        await db.query('INSERT INTO Pracownik (ID_Pracownika, Imie, Nazwisko, Stanowisko) VALUES ($1, $2, $3, $4)', 
            [ID_Pracownika || uuidv4(), Imie, Nazwisko, Stanowisko]);
        res.json({ message: 'Employee added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/employees/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { Imie, Nazwisko, Stanowisko } = req.body;
        await db.query('UPDATE Pracownik SET Imie = $1, Nazwisko = $2, Stanowisko = $3 WHERE ID_Pracownika = $4', 
            [Imie, Nazwisko, Stanowisko, id]);
        res.json({ message: 'Employee updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Feed (Pasza)

/**
 * @swagger
 * tags:
 *   name: Feed
 *   description: Managing feed and storage
 */

app.get('/api/feed', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM Pasza');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/feed', async (req, res) => {
    try {
        const { ID_Paszy, Nazwa_Paszy, Jednostka, Stan_Magazynowy } = req.body;
        await db.query('INSERT INTO Pasza (ID_Paszy, Nazwa_Paszy, Jednostka, Stan_Magazynowy) VALUES ($1, $2, $3, $4)', 
            [ID_Paszy || uuidv4(), Nazwa_Paszy, Jednostka, Stan_Magazynowy]);
        res.json({ message: 'Feed added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/feed/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { Nazwa_Paszy, Jednostka, Stan_Magazynowy } = req.body;
        await db.query('UPDATE Pasza SET Nazwa_Paszy = $1, Jednostka = $2, Stan_Magazynowy = $3 WHERE ID_Paszy = $4', 
            [Nazwa_Paszy, Jednostka, Stan_Magazynowy, id]);
        res.json({ message: 'Feed updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Locations (Lokalizacja)

/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: Managing animal locations and barns
 */

app.get('/api/locations', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM Lokalizacja');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/locations', async (req, res) => {
    try {
        const { ID_Lokalizacji, Nazwa_Lokalizacji, Typ_Lokalizacji, Pojemnosc } = req.body;
        await db.query('INSERT INTO Lokalizacja (ID_Lokalizacji, Nazwa_Lokalizacji, Typ_Lokalizacji, Pojemnosc) VALUES ($1, $2, $3, $4)', 
            [ID_Lokalizacji || uuidv4(), Nazwa_Lokalizacji, Typ_Lokalizacji, Pojemnosc]);
        res.json({ message: 'Location added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/locations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { Nazwa_Lokalizacji, Typ_Lokalizacji, Pojemnosc } = req.body;
        await db.query('UPDATE Lokalizacja SET Nazwa_Lokalizacji = $1, Typ_Lokalizacji = $2, Pojemnosc = $3 WHERE ID_Lokalizacji = $4', 
            [Nazwa_Lokalizacji, Typ_Lokalizacji, Pojemnosc, id]);
        res.json({ message: 'Location updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Production (Produkcja)

/**
 * @swagger
 * tags:
 *   name: Production
 *   description: Managing production logs (milk, etc.)
 */

app.get('/api/production', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT p.*, z.ID_Zwierzecia FROM Produkcja p LEFT JOIN Zwierze z ON p.ID_Zwierzecia = z.ID_Zwierzecia');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/production', async (req, res) => {
    try {
        const { ID_Produkcji, ID_Zwierzecia, Data_Produkcji, Typ_Produktu, Ilosc, Jednostka } = req.body;
        await db.query('INSERT INTO Produkcja (ID_Produkcji, ID_Zwierzecia, Data_Produkcji, Typ_Produktu, Ilosc, Jednostka) VALUES ($1, $2, $3, $4, $5, $6)', 
            [ID_Produkcji || uuidv4(), ID_Zwierzecia, Data_Produkcji, Typ_Produktu, Ilosc, Jednostka]);
        res.json({ message: 'Production added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/production/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { ID_Zwierzecia, Data_Produkcji, Typ_Produktu, Ilosc, Jednostka } = req.body;
        await db.query('UPDATE Produkcja SET ID_Zwierzecia = $1, Data_Produkcji = $2, Typ_Produktu = $3, Ilosc = $4, Jednostka = $5 WHERE ID_Produkcji = $6', 
            [ID_Zwierzecia, Data_Produkcji, Typ_Produktu, Ilosc, Jednostka, id]);
        res.json({ message: 'Production updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. Medical Events (Zdarzenie_Medyczne)

/**
 * @swagger
 * tags:
 *   name: Medical Events
 *   description: Tracking health and medical checkups
 */

app.get('/api/events/medical', async (req, res) => {
    try {
        const query = `
            SELECT zm.*, z.ID_Zwierzecia, p.Nazwisko as Nazwisko_Weterynarza
            FROM Zdarzenie_Medyczne zm
            LEFT JOIN Zwierze z ON zm.ID_Zwierzecia = z.ID_Zwierzecia
            LEFT JOIN Pracownik p ON zm.ID_Pracownika = p.ID_Pracownika
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/events/medical', async (req, res) => {
    try {
        const { ID_Zdarzenia_Medycznego, ID_Zwierzecia, ID_Pracownika, Data_Zdarzenia, Typ_Zdarzenia, Opis } = req.body;
        await db.query('INSERT INTO Zdarzenie_Medyczne (ID_Zdarzenia_Medycznego, ID_Zwierzecia, ID_Pracownika, Data_Zdarzenia, Typ_Zdarzenia, Opis) VALUES ($1, $2, $3, $4, $5, $6)', 
            [ID_Zdarzenia_Medycznego || uuidv4(), ID_Zwierzecia, ID_Pracownika, Data_Zdarzenia, Typ_Zdarzenia, Opis]);
        res.json({ message: 'Medical event added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/events/medical/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { ID_Zwierzecia, ID_Pracownika, Data_Zdarzenia, Typ_Zdarzenia, Opis } = req.body;
        await db.query('UPDATE Zdarzenie_Medyczne SET ID_Zwierzecia = $1, ID_Pracownika = $2, Data_Zdarzenia = $3, Typ_Zdarzenia = $4, Opis = $5 WHERE ID_Zdarzenia_Medycznego = $6', 
            [ID_Zwierzecia, ID_Pracownika, Data_Zdarzenia, Typ_Zdarzenia, Opis, id]);
        res.json({ message: 'Medical event updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 8. Feeding Events (Zdarzenie_Karmienia)

/**
 * @swagger
 * tags:
 *   name: Feeding Events
 *   description: Managing daily feeding and feeding events
 */

app.get('/api/events/feeding', async (req, res) => {
    try {
        const query = `
            SELECT zk.*, l.Nazwa_Lokalizacji, p.Nazwa_Paszy, pr.Nazwisko as Nazwisko_Pracownika
            FROM Zdarzenie_Karmienia zk
            LEFT JOIN Lokalizacja l ON zk.ID_Lokalizacji = l.ID_Lokalizacji
            LEFT JOIN Pasza p ON zk.ID_Paszy = p.ID_Paszy
            LEFT JOIN Pracownik pr ON zk.ID_Pracownika = pr.ID_Pracownika
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/events/feeding', async (req, res) => {
    try {
        const { ID_Zdarzenia_Karmienia, ID_Lokalizacji, ID_Paszy, ID_Pracownika, Data_Karmienia, Ilosc_Paszy } = req.body;
        await db.query('INSERT INTO Zdarzenie_Karmienia (ID_Zdarzenia_Karmienia, ID_Lokalizacji, ID_Paszy, ID_Pracownika, Data_Karmienia, Ilosc_Paszy) VALUES ($1, $2, $3, $4, $5, $6)', 
            [ID_Zdarzenia_Karmienia || uuidv4(), ID_Lokalizacji, ID_Paszy, ID_Pracownika, Data_Karmienia, Ilosc_Paszy]);
        res.json({ message: 'Feeding event added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/events/feeding/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { ID_Lokalizacji, ID_Paszy, ID_Pracownika, Data_Karmienia, Ilosc_Paszy } = req.body;
        await db.query('UPDATE Zdarzenie_Karmienia SET ID_Lokalizacji = $1, ID_Paszy = $2, ID_Pracownika = $3, Data_Karmienia = $4, Ilosc_Paszy = $5 WHERE ID_Zdarzenia_Karmienia = $6', 
            [ID_Lokalizacji, ID_Paszy, ID_Pracownika, Data_Karmienia, Ilosc_Paszy, id]);
        res.json({ message: 'Feeding event updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 9. Metadata (Breeds, Species, Locations, Employees, Feed) - Expanded

/**
 * @swagger
 * tags:
 *   name: Metadata
 *   description: System metadata for frontend selects
 */

app.get('/api/metadata', async (req, res) => {
    try {
        const breeds = (await db.query('SELECT * FROM Rasa')).rows;
        const species = (await db.query('SELECT * FROM Gatunek')).rows;
        const locations = (await db.query('SELECT * FROM Lokalizacja')).rows;
        const employees = (await db.query('SELECT * FROM Pracownik')).rows;
        const feed = (await db.query('SELECT * FROM Pasza')).rows;
        res.json({ breeds, species, locations, employees, feed });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
const startServer = () => {
    try {
        if (process.platform === 'win32') {
            const { execSync } = require('child_process');
            const output = execSync(`netstat -ano | findstr :${PORT}`).toString();
            const lines = output.split('\n');
            for (const line of lines) {
                if (line.includes('LISTENING')) {
                    const parts = line.trim().split(/\s+/);
                    const pid = parts[parts.length - 1];
                    if (pid && pid !== String(process.pid)) {
                        console.log(`Zabijanie osieroconego procesu na porcie ${PORT} (PID: ${pid})...`);
                        execSync(`taskkill /F /PID ${pid} 2>nul`);
                    }
                }
            }
        }
    } catch (e) {
        // Ignoruj błędy, jeśli nic nie nasłuchuje
    }

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`Błąd: Port ${PORT} jest wciąż zajęty. Zrestartuj VS Code lub system.`);
            process.exit(1);
        } else {
            console.error(err);
        }
    });
};

startServer();
