const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Import Routes
const layoutRoutes = require('./routes/layouts');
const extractionRoutes = require('./routes/extraction');
const verificationRoutes = require('./routes/verification');

// Use Routes
app.use('/layouts', layoutRoutes);
app.use('/extract', extractionRoutes);
app.use('/verify', verificationRoutes);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
