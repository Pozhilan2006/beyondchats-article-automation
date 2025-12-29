require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
const Article = require('../src/models/Article');
const connectDB = require('../src/config/db');

// simple slug generator
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
    .trim();

const BASE_URL = 'https://beyondchats.com/blogs/page/';

async function scrapeOldestArticles() {
  await connectDB();

  const collected = [];

  // pages 15 and 14 = oldest content
  for (const page of [15, 14]) {
    console.log(`Scraping page ${page}...`);
    const { data } = await axios.get(`${BASE_URL}${page}/`);
    const $ = cheerio.load(data);

    $('.entry-card').each((_, el) => {
      if (collected.length >= 5) return;

      const title = $(el).find('a.ct-media-container').attr('aria-label');
      const url = $(el).find('a.ct-media-container').attr('href');

      if (title && url) {
        collected.push({ title, url });
      }
    });
  }

  if (collected.length === 0) {
    console.log('❌ No articles found');
    process.exit(0);
  }

  // map to schema-safe documents
  const documents = collected.map((a) => ({
    title: a.title,
    slug: slugify(a.title),
    content: 'PENDING',          // IMPORTANT: placeholder
    sourceUrl: a.url,
    status: 'original',
    references: [],
  }));

  try {
    await Article.insertMany(documents, { ordered: false });
    console.log('✅ Seeded oldest 5 articles');
  } catch (err) {
    console.error('❌ Insert error:', err.message);
  }

  mongoose.connection.close();
}

scrapeOldestArticles();
