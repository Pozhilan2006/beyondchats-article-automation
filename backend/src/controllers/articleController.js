const Article = require('../models/Article');

/**
 * GET /api/articles
 * Query params:
 *  - page (default: 1)
 *  - limit (default: 5)
 *  - status (optional: original | updated)
 */
exports.getArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const status = req.query.status;

    const query = {};
    if (status) query.status = status;

    const total = await Article.countDocuments(query);

    const articles = await Article.find(query)
      .select('-contentHash') // hide internal field
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: articles,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
};

/**
 * GET /api/articles/:slug
 */
exports.getArticleBySlug = async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch article' });
  }
};
