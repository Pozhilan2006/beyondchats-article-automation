const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
    sourceUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['original', 'updated'],
      default: 'original',
    },
    references: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Article', ArticleSchema);
