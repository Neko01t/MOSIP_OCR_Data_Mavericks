const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;
const URL = process.env.CLIENT_URL || "http://localhost:5173"
const corsOptions = {
  origin: URL,
  credentials: true,
}

app.use(cors(corsOptions));
app.use(express.json());

// Import Routes
const layoutRoutes = require('./routes/layouts');
const extractionRoutes = require('./routes/extraction');
const verificationRoutes = require('./routes/verification');

// Use Routes
app.use('/layouts', layoutRoutes);
app.use('/extract', extractionRoutes);
app.use('/verify', verificationRoutes);

app.listen(PORT, () => {
    console.log(`Server running at ${PORT}`);
});
