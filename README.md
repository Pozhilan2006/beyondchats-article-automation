# BeyondChats Article Automation Backend

A backend system that automatically discovers, stores, and monitors BeyondChats blog articles, with support for content scraping, updates, and structured access via REST APIs.

This project is designed to demonstrate backend engineering fundamentals: data modeling, scraping pipelines, change detection, and clean API design.

---

## Architecture Overview

The system follows a clean, layered backend architecture:

- **Scripts layer**  
  One-time and scheduled jobs for:
  - Discovering blog articles
  - Seeding oldest posts
  - Scraping article content
  - Detecting content changes

- **API layer (Express)**  
  Exposes REST endpoints for fetching stored articles with pagination and filtering.

- **Database layer (MongoDB + Mongoose)**  
  Stores article metadata, content, references, and update timestamps.

Scraper Scripts ──▶ MongoDB ──▶ REST API ──▶ Clients

---

## Project Structure

```text
backend/
├── scripts/
│   ├── seedOldestArticles.js        # Seeds oldest blog articles
│   ├── scrapeBeyondChats.js         # Discovers article URLs
│   ├── scrapeArticles.js            # Scrapes article content
│   └── scrapeAndUpdateArticles.js   # Detects and updates changed content
│
├── src/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   │
│   ├── controllers/
│   │   └── articleController.js     # API logic
│   │
│   ├── models/
│   │   └── Article.js               # Article schema
│   │
│   ├── routes/
│   │   └── articleRoutes.js         # REST routes
│   │
│   ├── app.js                       # Express app setup
│   └── server.js                    # Entry point
│
├── .env.example
├── package.json
└── README.md

```

Article Data Model

Each article is stored with:

title

slug (unique)

content

sourceUrl

status (original or updated)

references

createdAt, updatedAt

lastScrapedAt

This allows tracking both initial content and future changes.

How to Run Locally
1. Install dependencies
cd backend
npm install

2. Setup environment variables

Create a .env file using .env.example:

PORT=5000
MONGO_URI=your_mongodb_connection_string

3. Start the server
npm run dev


Server runs at:

http://localhost:5000

Scraping & Automation

Seed oldest articles:

node scripts/seedOldestArticles.js


Scrape article content:

node scripts/scrapeArticles.js


Detect and update changed content:

node scripts/scrapeAndUpdateArticles.js

API Endpoints

Get articles (paginated):

GET /api/articles?page=1&limit=5


Filter by status:

GET /api/articles?status=updated

Design Decisions

Separation of scripts and API
Scraping is intentionally kept out of request/response cycles.

Idempotent scraping
Scripts can be re-run safely without duplicating data.

Change detection over blind updates
Articles are only marked updated when content actually changes.

Minimal scope, maximum clarity
No frontend or auth added intentionally to keep focus on backend correctness.

Why This Stands Out

Real-world scraping and persistence workflow

Clear data modeling

Clean REST APIs

Safe update strategy

Practical engineering restraint (no overengineering)

This reflects how backend automation systems are built and maintained in production environments.

Future Enhancements (Out of Scope)

Scheduler (cron / queue)

Frontend dashboard

Content diff visualization

Notifications on updates
