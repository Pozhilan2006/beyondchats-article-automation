require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const connectDB = require('../src/config/db');

const BASE_URL = 'https://beyondchats.com/blogs';

async function fetchPage(pageNumber) {
  const url = `${BASE_URL}/page/${pageNumber}/`;
  const response = await axios.get(url);
  return response.data;
}

async function scrapeOldestArticles() {
  await connectDB();

  const collected = [];
  let currentPage = 15; // confirmed last page

  while (collected.length < 5 && currentPage > 0) {
    console.log(`Scraping page ${currentPage}...`);

    const html = await fetchPage(currentPage);
    const $ = cheerio.load(html);

    const articles = [];

    $('article.entry-card').each((_, el) => {
      const linkEl = $(el).find('a.ct-media-container');
      const title = linkEl.attr('aria-label');
      const url = linkEl.attr('href');

      if (title && url) {
        articles.push({ title, url });
      }
    });

    // Articles are newest → oldest, so reverse
    articles.reverse();

    for (const article of articles) {
      if (collected.length >= 5) break;
      collected.push(article);
    }

    currentPage--;
  }

  console.log('✅ Oldest 5 articles:');
  collected.forEach((a, i) => {
    console.log(`${i + 1}. ${a.title}`);
    console.log(`   ${a.url}`);
  });
}

scrapeOldestArticles()
  .then(() => {
    console.log('Scraping completed');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Scraping failed:', err.message);
    process.exit(1);
  });
