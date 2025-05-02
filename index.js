const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;
const API_KEY = process.env.API_KEY;
const CREDS_DIR = path.join(__dirname, 'creds');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

fs.ensureDirSync(CREDS_DIR);

// ذخیره کردن داده‌ها
app.post('/api/uploadCreds.php', async (req, res) => {
    const key = req.headers['x-api-key'];
    const { credsId, credsData } = req.body;

    if (!key || key !== API_KEY) {
        return res.status(403).json({ error: 'Invalid API key' });
    }

    if (!credsId || !credsData) {
        return res.status(400).json({ error: 'Missing credsId or credsData' });
    }

    try {
        const filePath = path.join(CREDS_DIR, `${credsId}.json`);
        await fs.writeJson(filePath, credsData, { spaces: 2 });
        res.json({ success: true, message: 'Credentials saved', credsId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save credentials' });
    }
});

// مشاهده سشن
app.get('/api/viewSession.php', async (req, res) => {
    const credsId = req.query.credsId;

    if (!credsId) {
        return res.status(400).json({ error: 'Missing credsId' });
    }

    try {
        const filePath = path.join(CREDS_DIR, `${credsId}.json`);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const sessionData = await fs.readJson(filePath);
        res.json({ success: true, sessionData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve session' });
    }
});

// حذف سشن
app.delete('/api/deleteSession.php', async (req, res) => {
    const credsId = req.body.credsId;

    if (!credsId) {
        return res.status(400).json({ error: 'Missing credsId' });
    }

    try {
        const filePath = path.join(CREDS_DIR, `${credsId}.json`);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Session not found' });
        }

        await fs.remove(filePath);
        res.json({ success: true, message: 'Session deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete session' });
    }
});

app.listen(PORT, () => {
    console.log(`Session API running on port ${PORT}`);
});