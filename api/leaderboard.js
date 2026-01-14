
import dotenv from 'dotenv';
// Load env vars if locally (Vercel injects them automatically in prod, but safe to keep)
dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_FILE_PATH = 'server/leaderboard.json';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;

const getAuthHeaders = () => ({
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'User-Agent': 'DuskPup-Leaderboard-Server'
});

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // ---------------------------------------------------------
    // GET: Read Leaderboard
    // ---------------------------------------------------------
    if (req.method === 'GET') {
        try {
            if (!GITHUB_TOKEN) {
                return res.status(500).json({ error: 'Server Configuration Error: Missing GITHUB_TOKEN' });
            }

            const response = await fetch(GITHUB_API_URL, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`GitHub API Error: ${response.statusText}`);
            }

            const json = await response.json();
            const content = Buffer.from(json.content, 'base64').toString('utf8');
            return res.status(200).json(JSON.parse(content));
        } catch (error) {
            console.error('Error reading leaderboard:', error);
            return res.status(500).json({ error: 'Failed to read leaderboard' });
        }
    }

    // ---------------------------------------------------------
    // POST: Update Leaderboard
    // ---------------------------------------------------------
    if (req.method === 'POST') {
        try {
            const { genre, username, score } = req.body;

            if (!genre || score === undefined || !username) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            if (!GITHUB_TOKEN) {
                return res.status(500).json({ error: 'Server Configuration Error: Missing GITHUB_TOKEN' });
            }

            // 1. Get current file (need SHA for update)
            const getResponse = await fetch(GITHUB_API_URL, {
                headers: getAuthHeaders()
            });

            if (!getResponse.ok) {
                throw new Error('Failed to fetch current leaderboard to get SHA');
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

                return res.status(200).json({ success: true, leaderboard: currentContent });
            }

            // Not a high score
            return res.status(200).json({ success: false, message: 'Not a high score', leaderboard: currentContent });

        } catch (error) {
            console.error('Error updating leaderboard:', error);
            return res.status(500).json({ error: 'Failed to update leaderboard' });
        }
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
}
