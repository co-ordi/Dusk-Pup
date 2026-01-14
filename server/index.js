
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Fallback local file for dev/offline if needed
const LOCAL_DB_FILE = path.join(__dirname, 'leaderboard.json');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_FILE_PATH = 'server/leaderboard.json';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;

// Helper Config for Fetch
const getAuthHeaders = () => ({
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'User-Agent': 'DuskPup-Leaderboard-Server'
});

// Initial local file check
if (!fs.existsSync(LOCAL_DB_FILE)) {
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify({
        deep_house: null,
        amapiano: null,
        afro_house: null,
        gqom: null
    }, null, 2));
}

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        if (!GITHUB_TOKEN) {
            console.warn('No GitHub Token provided. Falling back to local file.');
            const data = fs.readFileSync(LOCAL_DB_FILE, 'utf8');
            return res.json(JSON.parse(data));
        }

        const response = await fetch(GITHUB_API_URL, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`GitHub API Error: ${response.statusText}`);
        }

        const json = await response.json();
        // GitHub returns content in base64
        const content = Buffer.from(json.content, 'base64').toString('utf8');
        res.json(JSON.parse(content));

    } catch (error) {
        console.error('Error reading leaderboard:', error);
        // Fallback to local on error? Or return error?
        // Failing gracefully to empty or local is safer for uptime
        try {
            const data = fs.readFileSync(LOCAL_DB_FILE, 'utf8');
            res.json(JSON.parse(data));
        } catch {
            res.status(500).json({ error: 'Failed to read leaderboard' });
        }
    }
});

// Update high score
app.post('/api/leaderboard', async (req, res) => {
    try {
        const { genre, username, score } = req.body;

        if (!genre || score === undefined || !username) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!GITHUB_TOKEN) {
            // Local only fallback
            const data = JSON.parse(fs.readFileSync(LOCAL_DB_FILE, 'utf8'));
            const currentEntry = data[genre];
            if (!currentEntry || score > currentEntry.score) {
                data[genre] = { username: username.trim(), score, updatedAt: Date.now() };
                fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(data, null, 2));
                return res.json({ success: true, leaderboard: data });
            }
            return res.json({ success: false, message: 'Not a high score (local)', leaderboard: data });
        }

        // 1. Get current file (need SHA for update)
        const getResponse = await fetch(GITHUB_API_URL, {
            headers: getAuthHeaders()
        });

        if (!getResponse.ok) {
            throw new Error('Failed to fetch current leaderboard from GitHub');
        }

        const getJson = await getResponse.json();
        const currentSha = getJson.sha;
        const currentContent = JSON.parse(Buffer.from(getJson.content, 'base64').toString('utf8'));

        const currentEntry = currentContent[genre];

        // 2. Check High Score
        if (!currentEntry || score > currentEntry.score) {
            // Update Data
            currentContent[genre] = {
                username: username.trim(),
                score,
                updatedAt: Date.now()
            };

            // 3. Commit to GitHub
            // Note: We use the username in the commit message for tracking!
            const putBody = {
                message: `feat: New high score by ${username} in ${genre} (${score})`,
                content: Buffer.from(JSON.stringify(currentContent, null, 2)).toString('base64'),
                sha: currentSha,
                branch: 'main'
            };

            const putResponse = await fetch(GITHUB_API_URL, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(putBody)
            });

            if (!putResponse.ok) {
                const errText = await putResponse.text();
                throw new Error(`Failed to commit to GitHub: ${errText}`);
            }

            // Sync local file too just in case
            fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(currentContent, null, 2));

            return res.json({ success: true, leaderboard: currentContent });
        }

        res.json({ success: false, message: 'Not a high score', leaderboard: currentContent });

    } catch (error) {
        console.error('Error updating leaderboard:', error);
        res.status(500).json({ error: 'Failed to update leaderboard' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
