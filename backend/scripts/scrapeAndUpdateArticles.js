require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');

const connectDB = require('../src/config/db');
const Article = require('../src/models/Article');

/**
 * Create SHA256 hash of content
 */
const hashContent = (text) => {
  return crypto.createHash('sha256').update(text).digest('hex');
};

/**
 * Scrape a single article page
 */
const scrapeArticlePage = async (url) => {
  const { data } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });

  const $ = cheerio.load(data);

  const title = $('h1').first().text().trim();

  const articleRoot =
    $('main article').first().length
      ? $('main article').first()
      : $('div[data-elementor-type="single-post"]').first();

  const cleanContent = articleRoot
    .find('p')
    .map((_, el) => $(el).text().trim())
    .get()
    .join('\n\n');

  const references = [
    ...new Set(
      articleRoot
        .find('a[href]')
        .map((_, el) => $(el).attr('href'))
        .get()
        .filter(
          (href) =>
            href &&
            href.startsWith('http') &&
            !href.includes('#')
        )
    ),
  ];

  return {
    title,
    cleanContent,
    references,
  };
};

/**
 * Main runner
 */
const run = async () => {
  await connectDB();

  const articles = await Article.find({});

  console.log(`🔍 Found ${articles.length} articles to check`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const article of articles) {
    console.log(`➡️ Checking: ${article.sourceUrl}`);

    const scraped = await scrapeArticlePage(article.sourceUrl);

    if (!scraped.cleanContent || scraped.cleanContent.length < 50) {
        console.log('⚠️ Skipping article with empty or invalid content');
        continue;
    }
    const newHash = hashContent(scraped.cleanContent);

    // FIRST TIME HASH (safety for Phase 2 data)
    if (!article.contentHash) {
      article.content = scraped.cleanContent;
      article.references = scraped.references;
      article.contentHash = newHash;
      article.lastScrapedAt = new Date();
      article.status = 'original';

      await article.save();
      console.log('🆕 Initial content stored');
      continue;
    }

    // NO CHANGE
    if (article.contentHash === newHash) {
      skippedCount++;
      console.log('⏭️ No change detected');
      continue;
    }

    // CONTENT CHANGED
    article.content = scraped.cleanContent;
    article.references = scraped.references;
    article.contentHash = newHash;
    article.lastScrapedAt = new Date();
    article.status = 'updated';

    await article.save();
    updatedCount++;
    console.log('♻️ Article updated');
  }

  console.log('\n✅ Phase 3 completed');
  console.log(`Updated: ${updatedCount}`);
  console.log(`Unchanged: ${skippedCount}`);

  process.exit(0);
};

run();
