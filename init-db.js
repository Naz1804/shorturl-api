const pool = require('./db')

async function initDatabase() {
    try {
        // Create the urls table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS urls (
              id SERIAL PRIMARY KEY,
              original_url TEXT NOT NULL,
              short_code VARCHAR(10) UNIQUE NOT NULL,
              clicks INTEGER DEFAULT 0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Database table created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error creating table:', error);
        process.exit(1);
    }
}

initDatabase();