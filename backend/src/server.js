require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const articleRoutes = require('./routes/articleRoutes');

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== Routes =====
app.get('/', (req, res) => {
  res.send('BeyondChats Article Automation API');
});

app.use('/api/articles', articleRoutes);

// ===== Server =====
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
