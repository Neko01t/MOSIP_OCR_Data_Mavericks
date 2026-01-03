const express = require('express');
const router = express.Router();

let LAYOUTS = {};
try {
    LAYOUTS = require('../layout');
} catch (e) {
    LAYOUTS = { generic: { name: 'Generic', keywords: [], fields: {} } };
}

router.get('/', (req, res) => {
    const options = Object.keys(LAYOUTS).map(key => ({
        id: key,
        name: LAYOUTS[key].name
    }));
    res.json(options);
});

module.exports = router;
