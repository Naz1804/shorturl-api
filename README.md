# URL Shortener API
## Overview
A RESTful API built with Node.js, Express, and PostgreSQL that provides URL shortening services with built-in analytics tracking. This backend handles short code generation, URL redirection, and click analytics, demonstrating production-ready API architecture and database integration.

This project focuses on RESTful design principles, database schema design, asynchronous operations, and deployment best practices.

## Why this project
This project was built to demonstrate backend development skills including API design, database management, and cloud deployment. It showcases how to build a scalable service that handles data persistence, implements analytics, and integrates with frontend applications while maintaining clean, maintainable code architecture.

## Key Features
- RESTful API for URL shortening with unique short code generation
- PostgreSQL database integration for persistent data storage
- Click analytics tracking with timestamps
- Collision handling for short code uniqueness
- Environment-based configuration for local and production environments
- CORS-enabled for cross-origin frontend integration
- Deployed on Render with Neon PostgreSQL database

## Technical Stack
- Runtime: Node.js
- Framework: Express.js
- Database: PostgreSQL (Neon)
- Libraries:
  * pg - PostgreSQL client
  * cors - Cross-origin resource sharing
  * dotenv - Environment variable management
- Deployment: Render (backend) + Neon (database)

## API Endpoints
`POST /api/shorten`

Shortens a URL and returns the shortened link.

Request Body:
```bash
{
  "url": "https://example.com"
}
```
Response:
```bash
{
  "originalUrl": "https://example.com",
  "shortUrl": "https://your-live-api-endpoint/abc123",
  "shortCode": "abc123",
  "createdAt": "2026-01-17T10:30:00.000Z"
}
```

`GET /:shortCode`
Redirects to the original URL and increments click count.

Example: `GET /abc123` → Redirects to `https://example.com`

`GET /api/stats/:shortCode`

Returns analytics for a specific shortened URL.

Resposne:
```bash
{
  "original_url": "https://example.com",
  "short_code": "abc123",
  "clicks": 42,
  "created_at": "2026-01-17T10:30:00.000Z"
}
```

`GET /api/stats`

Returns all shortened URLs with analytics (admin/debug endpoint).

## Database Schema
Table:`urls`
```bash
CREATE TABLE urls (
  id SERIAL PRIMARY KEY,
  original_url TEXT NOT NULL,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Technical Decisions
- Express.js was chosen for its lightweight, unopinionated nature and robust middleware ecosystem, making it ideal for building RESTful APIs.
- PostgreSQL provides ACID compliance, relational data integrity, and is well-suited for analytics with efficient querying capabilities.
- Environment Variables separate configuration from code, enabling secure credential management and easy deployment across environments.
- Async/Await pattern ensures non-blocking database operations while maintaining readable, maintainable code.
- Parameterized Queries (`$1`, `$2` placeholders) prevent SQL injection attacks and follow security best practices.
- Base URL Configuration uses environment variables to generate correct short URLs in both local development and production environments.

## Local Development Setup
Prerequisites
- Node.js (v18+)
- PostgreSQL database

### Installation
1. Clone the repository:
```bash
git clone https://github.com/Naz1804/shorturl-api.git
cd shorturl-api
```
2. Install dependencies:
```bash
npm install
```
3. Create `.env` file:
```bash
DATABASE_URL=postgresql://username:password@host/database
BASE_URL=http://localhost:5000
PORT=5000
```
4. Initialize database:
```bash
node init-db.js
```
5. Start development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## Challenges & Solutions

* **Short Code Uniqueness:** Implemented collision detection with while-loop regeneration to ensure unique codes even with random generation. Alternative approaches considered: base62 encoding of database IDs or hash-based generation.
* **Database Connection Security:** Configured SSL for secure PostgreSQL connections and used environment variables to protect credentials from exposure in version control.
* **CORS Configuration:** Enabled cross-origin requests to allow frontend (hosted on Netlify) to communicate with backend (hosted on Render) while maintaining security.
* **Environment-Based URLs:** Implemented dynamic BASE_URL configuration to generate correct short URLs in both local development and production without code changes.
* **Click Analytics:** Used atomic SQL `UPDATE` operations (`clicks = clicks + 1`) to prevent race conditions when multiple users click the same link simultaneously.

## Future Improvements

* Implement user authentication with JWT tokens for personalized link management
* Add custom alias support for vanity URLs
* Implement link expiration with TTL (time-to-live) settings
* Add rate limiting to prevent API abuse
* Create admin dashboard for system-wide analytics
* Implement link categorization and tagging
* Add QR code generation for shortened URLs
* Set up automated testing (Jest/Supertest) for API endpoints
* Implement caching layer (Redis) for frequently accessed URLs
* Add detailed analytics (geographic data, referrer tracking, device types)

## Frontend
**Frontend Repository:** [Frontend Code](https://github.com/Naz1804/url_shortening_shortly)

**Frontend Demo:** [Live Website](https://shortly-url-shortening-07f14c.netlify.app/)
