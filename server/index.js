
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

const DB_FILE = path.join(__dirname, 'leaderboard.json');

// Ensure DB file exists
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({
        deep_house: null,
        amapiano: null,
        afro_house: null,
        gqom: null
    }, null, 2));
}

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading leaderboard:', error);
        res.status(500).json({ error: 'Failed to read leaderboard' });
    }
});

// Update high score
app.post('/api/leaderboard', (req, res) => {
    try {
        const { genre, username, score } = req.body;

        if (!genre || score === undefined || !username) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        const currentEntry = data[genre];

        // Only update if it's a new high score
        // Note: This logic mirrors the client-side check but as a safety measure
        if (!currentEntry || score > currentEntry.score) {
            data[genre] = {
                username: username.trim(),
                score,
                updatedAt: Date.now()
            };

            fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
            return res.json({ success: true, leaderboard: data });
        }

        res.json({ success: false, message: 'Not a high score', leaderboard: data });
    } catch (error) {
        console.error('Error updating leaderboard:', error);
        res.status(500).json({ error: 'Failed to update leaderboard' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
