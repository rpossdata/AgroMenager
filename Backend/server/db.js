const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const createTables = async () => {
  const schema = `
    CREATE TABLE IF NOT EXISTS Gatunek (
      ID_Gatunku TEXT PRIMARY KEY,
      Nazwa_Gatunku TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Rasa (
      ID_Rasy TEXT PRIMARY KEY,
      ID_Gatunku TEXT,
      Nazwa_Rasy TEXT NOT NULL,
      FOREIGN KEY (ID_Gatunku) REFERENCES Gatunek(ID_Gatunku)
    );

    CREATE TABLE IF NOT EXISTS Lokalizacja (
      ID_Lokalizacji TEXT PRIMARY KEY,
      Nazwa_Lokalizacji TEXT NOT NULL,
      Typ_Lokalizacji TEXT,
      Pojemnosc INTEGER
    );

    CREATE TABLE IF NOT EXISTS Pracownik (
      ID_Pracownika TEXT PRIMARY KEY,
      Imie TEXT NOT NULL,
      Nazwisko TEXT NOT NULL,
      Stanowisko TEXT
    );

    CREATE TABLE IF NOT EXISTS Pasza (
      ID_Paszy TEXT PRIMARY KEY,
      Nazwa_Paszy TEXT NOT NULL,
      Jednostka TEXT,
      Stan_Magazynowy REAL
    );

    CREATE TABLE IF NOT EXISTS Zwierze (
      ID_Zwierzecia TEXT PRIMARY KEY,
      ID_Rasy TEXT,
      ID_Lokalizacji TEXT,
      Data_Urodzenia DATE,
      Plec TEXT,
      Status TEXT,
      ID_Matki TEXT,
      ID_Ojca TEXT,
      FOREIGN KEY (ID_Rasy) REFERENCES Rasa(ID_Rasy),
      FOREIGN KEY (ID_Lokalizacji) REFERENCES Lokalizacja(ID_Lokalizacji),
      FOREIGN KEY (ID_Matki) REFERENCES Zwierze(ID_Zwierzecia),
      FOREIGN KEY (ID_Ojca) REFERENCES Zwierze(ID_Zwierzecia)
    );

    CREATE TABLE IF NOT EXISTS Produkcja (
      ID_Produkcji TEXT PRIMARY KEY,
      ID_Zwierzecia TEXT,
      Data_Produkcji DATE,
      Typ_Produktu TEXT,
      Ilosc REAL,
      Jednostka TEXT,
      FOREIGN KEY (ID_Zwierzecia) REFERENCES Zwierze(ID_Zwierzecia)
    );

    CREATE TABLE IF NOT EXISTS Zdarzenie_Medyczne (
      ID_Zdarzenia_Medycznego TEXT PRIMARY KEY,
      ID_Zwierzecia TEXT,
      ID_Pracownika TEXT,
      Data_Zdarzenia DATE,
      Typ_Zdarzenia TEXT,
      Opis TEXT,
      FOREIGN KEY (ID_Zwierzecia) REFERENCES Zwierze(ID_Zwierzecia),
      FOREIGN KEY (ID_Pracownika) REFERENCES Pracownik(ID_Pracownika)
    );

    CREATE TABLE IF NOT EXISTS Zdarzenie_Karmienia (
      ID_Zdarzenia_Karmienia TEXT PRIMARY KEY,
      ID_Lokalizacji TEXT,
      ID_Paszy TEXT,
      ID_Pracownika TEXT,
      Data_Karmienia TIMESTAMP,
      Ilosc_Paszy REAL,
      FOREIGN KEY (ID_Lokalizacji) REFERENCES Lokalizacja(ID_Lokalizacji),
      FOREIGN KEY (ID_Paszy) REFERENCES Pasza(ID_Paszy),
      FOREIGN KEY (ID_Pracownika) REFERENCES Pracownik(ID_Pracownika)
    );
  `;

  try {
    await pool.query(schema);
    console.log('Database schema initialized.');
    await seedData();
  } catch (err) {
    console.error('Error creating tables:', err);
  }
};

const seedData = async () => {
  try {
    const res = await pool.query('SELECT COUNT(*) as count FROM Gatunek');
    const speciesCount = parseInt(res.rows[0].count, 10);
    
    if (speciesCount === 0) {
      console.log('Seeding data...');
      
      const insertGatunek = 'INSERT INTO Gatunek (ID_Gatunku, Nazwa_Gatunku) VALUES ($1, $2)';
      await pool.query(insertGatunek, ['G01', 'Bydło']);
      await pool.query(insertGatunek, ['G02', 'Trzoda Chlewna']);
      await pool.query(insertGatunek, ['G03', 'Drób']);

      const insertRasa = 'INSERT INTO Rasa (ID_Rasy, ID_Gatunku, Nazwa_Rasy) VALUES ($1, $2, $3)';
      await pool.query(insertRasa, ['R01', 'G01', 'Holsztyno-Fryzyjska']);
      await pool.query(insertRasa, ['R02', 'G01', 'Simental']);
      await pool.query(insertRasa, ['R03', 'G02', 'Polska Biała Zwisłoucha']);
      await pool.query(insertRasa, ['R04', 'G03', 'Leghorn']);

      const insertLokalizacja = 'INSERT INTO Lokalizacja (ID_Lokalizacji, Nazwa_Lokalizacji, Typ_Lokalizacji, Pojemnosc) VALUES ($1, $2, $3, $4)';
      await pool.query(insertLokalizacja, ['L01', 'Obora Główna', 'Budynek', 50]);
      await pool.query(insertLokalizacja, ['L02', 'Chlewnia 1', 'Budynek', 100]);
      await pool.query(insertLokalizacja, ['L03', 'Kurnik', 'Budynek', 500]);
      await pool.query(insertLokalizacja, ['L04', 'Pastwisko Północne', 'Teren Otwarty', 1000]);

      const insertPasza = 'INSERT INTO Pasza (ID_Paszy, Nazwa_Paszy, Jednostka, Stan_Magazynowy) VALUES ($1, $2, $3, $4)';
      await pool.query(insertPasza, ['P01', 'Sianokiszonka', 'kg', 5000]);
      await pool.query(insertPasza, ['P02', 'Otręby Pszenne', 'kg', 200]);

      console.log('Data seeded.');
    }
  } catch (err) {
    console.error('Error seeding data:', err);
  }
};

createTables();

module.exports = pool;
