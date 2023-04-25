const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const mysql = require('mysql2');
const cors = require('cors');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const path = require('path');

/*
const corsOptions = {
    origin: 'http://localhost:5500/frontend/index.html',
    credentials: true
} // cors beállítások
*/
// json parse-olás
app.use(express.json());
app.use(express.static('files'));

//app.use(fileUpload());

// Cors
app.use(cors());

// Session
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Adatbázis kapcsolódás
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cars'
});

// Regisztráció
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    connection.query('SELECT * FROM users WHERE username = ?', [username], (error, results) => {
        if (error) throw error;

        if (results.length > 0) {
            return res.status(400).json({ message: 'A felhasználónév már foglalt!' });
        }

        bcrypt.hash(password, saltRounds, (error, hash) => {
            if (error) throw error;

            connection.query('INSERT INTO users (id, username, password, role) VALUES (NULL, ?, ?, "user")', [username, hash], (error) => {
                if (error) throw error;

                res.json({ message: 'Sikeres regisztráció!' });
            });
        });
    });
});

// Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    connection.query('SELECT * FROM users WHERE username = ?', [username], (error, results) => {
        if (error) throw error;

        if (results.length === 0) {
            return res.status(400).json({ message: 'A felhasználónév vagy jelszó hibás!' });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (error, result) => {
            if (error) throw error;

            if (!result) {
                return res.status(400).json({ message: 'A felhasználónév vagy jelszó hibás!' });
            }

            req.session.username = username;
            req.session.role = user.role;

            res.json({ username: req.session.username, role: req.session.role });
        });
    });
});

// Logout
app.post('/logout', (req, res) => {
    if (!req.session.username) {
        return res.status(400).json({ message: 'Nincs bejelentkezett felhasználó' });
    }

    req.session.destroy(() => {
        res.json({ message: 'Sikeres kijelentkezés!' });
    });
});

// A kártyák adatainak lekérdezése adatbázisból
app.post('/cards', (req, res) => {
    // Ha megkaptuk a request-ből hogy mit szeretnénk lekérdezni.
    const searchingField = req.body.searchingField;
    const searchType = req.body.searchType;
    console.log(searchingField);
    console.log(searchType);
    connection.query('SELECT * FROM car WHERE ?? LIKE ? ORDER BY marka, tipus', [searchType, `%${searchingField}%`], (error, results) => {
        try {
            if (error) throw error;
            res.json(results);
        } catch (error) {
            console.error(error);
        }
    });
}
);

// Jelszó módosítása
app.post('/passwordChange', (req, res) => {
    const { username, password } = req.body;
    console.log("1.");
    bcrypt.hash(password, saltRounds, (error, hash) => {
        if (error) throw error;
        console.log("2.");
        connection.query('UPDATE users SET password = ? WHERE username = ?', [hash, username], (error) => {
            if (error) throw error;
            console.log("3.");
            res.json({ message: 'Sikeres jelszó módosítás!' });
        });
    });
});


// Új autó feltöltése
app.post('/newCar', fileUpload({ createParentPath: true }), (req, res) => {
    const { brand, type, year } = req.body;
    const picture = req.files ? req.files.newPicture : null;

    if (!picture) {
        return res.status(400).json({ message: 'A kép hiányzik!' });
    }

    // A kép mentése a 'files' mappába
    const filepath = path.join(__dirname, 'files', picture.name)
    picture.mv(filepath, (err) => {
        if (err) {
            return res.status(500).json({ message: err });
        }

        // Az adatok beillesztése az adatbázisba. A képnek csak a neve kerül ide
        const sql = 'INSERT INTO car (id, marka, tipus, kep, evjarat) VALUES (NULL, ?, ?, ?, ?)';
        const values = [brand, type, picture.name, year];
        connection.query(sql, values, (error) => {
            if (error) {
                return res.status(500).json({ message: error });
            }

            res.json({ message: 'Sikeres autó felvétel!' });
        });
    });
});

// Autó törlése
app.post('/deleteCar', (req, res) => {
    const carId = req.body.id;
    console.log(`${carId}`);

    const query = `DELETE FROM car WHERE id = ?`;
    connection.query(query, [carId], (error, results) => {
        if (error) {
            console.error('Hiba au autó törlésekor:', error);
            res.status(500).json({ error: 'Hiba lépett fel az autó törlésekor.' });
        } else if (results.affectedRows === 0) {
            res.status(404).json({ error: 'Az autó nem található.' });
        } else {
            res.json({ message: `A ${carId} azonosítójú autó törölve.` });
        }
    });
});

// Autó adatainak frissítése
app.post('/updateCar', fileUpload({ createParentPath: true }), (req, res) => {
    console.log(req.files);
    const { editableId, editBrand, editType, editYear } = req.body;
    const picture = req.files ? req.files.editPicture : null;

    console.log(editableId, editBrand, editType, editYear);

    // Ha a kép üres, beállítjuk null-ra az értéket
    const pictureName = picture ? picture.name : null;
    console.log(pictureName);

    // A kép mentése a 'files' mappába, ha van új kép
    if (picture) {
        const filepath = path.join(__dirname, 'files', picture.name);
        picture.mv(filepath, (err) => {
            if (err) {
                return res.status(500).json({ message: err });
            }
            console.log('kép elmentve');
        });
    }

    // Csak a nem üres mezők frissítése az adatbázisban (COALESCE), mivel nem minden mezőt kell updatelni, csak azokat, amiket a frontendről szeretnénk módosítani
    const sql = 'UPDATE car SET marka = COALESCE(?, marka), tipus = COALESCE(?, tipus), kep = COALESCE(?, kep), evjarat = COALESCE(?, evjarat) WHERE id = ?';
    const values = [editBrand, editType, pictureName, editYear, editableId];
    connection.query(sql, values, (error) => {
        if (error) {
            console.log('az adatbázisban sikeresen megvan minden');
            return res.status(500).json({ message: error });
        }

        res.json({ message: 'Sikeres módosítás!' });
    });

});

// Szerver futása
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
