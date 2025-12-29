require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const connectDB = require('../src/config/db');
const Article = require('../src/models/Article');

const scrapeArticlePage = async (url) => {
  const { data } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
  });

  const $ = cheerio.load(data);

  const articleRoot =
    $('main article').first().length
      ? $('main article').first()
      : $('div[data-elementor-type="single-post"]').first();

  const content = articleRoot
    .find('p')
    .map((_, el) => $(el).text().trim())
    .get()
    .join('\n\n');

  const references = articleRoot
    .find('a[href]')
    .map((_, el) => $(el).attr('href'))
    .get()
    .filter(
      (href) =>
        href &&
        href.startsWith('http') &&
        !href.includes('#')
    );

  return { content, references };
};

const run = async () => {
  await connectDB();

  const articles = await Article.find(
    { content: 'PENDING' },   // 🔥 only update pending articles
    { sourceUrl: 1 }
  );

  for (const article of articles) {
    console.log(`Scraping content: ${article.sourceUrl}`);

    const data = await scrapeArticlePage(article.sourceUrl);

    await Article.updateOne(
      { sourceUrl: article.sourceUrl },
      {
        $set: {
          content: data.content,
          references: data.references,
        },
      }
    );
  }

  console.log('✅ Article content scraping completed');
  process.exit(0);
};

run();
