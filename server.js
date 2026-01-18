const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');  // Import Database connection

const app = express()    // Creates server application
const PORT = process.env.PORT || 5000;    // server listen 5000 by default

// Middleware  (code that runs for every request)
app.use(cors());         // allows request from netlify
app.use(express.json());  // recieve JSON data from requests


// Test route  | when someone visit and get a message
app.get('/', (req, res) => {
    res.json({ message: 'Hello from my API!' });
});


//Function to generate random short code
function generateShortCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shortCode = '';
    for (let i = 0; i < 6; i++) {
        shortCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return shortCode;
}

// use of async/await as DB operations take time
// POST endpoint to shorten URL
app.post('/api/shorten', async (req, res) => {
    try {
        const { url } = req.body;

        //Validate URL exists
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Generate unique short code
        let shortCode = generateShortCode();
        let isUnique = false;

        // keep generating until we got a unique code
        while (isUnique) {
            const existing = await pool.query(
                'SELECT id FROM urls WHERE short_code = $1',     //$1 placed as a value to prevent SQL injection
                [shortCode]
            );

            if (existing.rows.length === 0) {
                isUnique = true;
            } else {
                shortCode = generateShortCode();
            }
        }



        // Insert into database
        const result = await pool.query(
            'INSERT INTO urls (original_url, short_code) VALUES ($1, $2) RETURNING *',
            [url, shortCode]
        );

        const savedUrl = result.rows[0];

        // Return the shortened URL
        const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
        const shortUrl = `${BASE_URL}/${shortCode}`;
        res.json({
            originalUrl: savedUrl.original_url,
            shortUrl: shortUrl,
            shortCode: savedUrl.short_code,
            createdAt: savedUrl.created_at
        });
    } catch (error) {
        console.error('Error shortening URL:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET endpoint to redirect   dynamic routing
app.get("/:shortCode", async (req, res) => {
    try {
        const { shortCode } = req.params;

        // Find URL in database
        const result = await pool.query(
            "SELECT * FROM urls WHERE short_code = $1",
            [shortCode],
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "URL not found" });
        }

        const urlData = result.rows[0];

        // Increment click count (analytics!)
        await pool.query(
            "UPDATE urls SET clicks = clicks + 1 WHERE short_code = $1",
            [shortCode],
        );

        // Redirect to original URL
        res.redirect(urlData.original_url);

    } catch (error) {
        console.error("Error redirecting:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Stats endpoint to seee all URLs
app.get('/api/stats', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM urls ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Single URL stats
app.get('/api/stats/:shortCode', async (req, res) => {
    try {
        const { shortCode } = req.params;

        const result = await pool.query(
            'SELECT original_url, short_code, clicks, created_at FROM urls WHERE short_code = $1',
            [shortCode]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'URL not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Server error' });
    }
}) 

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});