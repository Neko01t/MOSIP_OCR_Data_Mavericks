const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const stringSimilarity = require('string-similarity');
const { getCleanText } = require('../utils/ocr');

// Load layouts safely
let LAYOUTS = {};
try {
    LAYOUTS = require('../layout');
} catch (e) {
    LAYOUTS = { generic: { name: 'Generic', keywords: [], fields: {} } };
}

const upload = multer({ dest: 'uploads/' });

const extractField = (textLines, fieldConfig) => {
    if (!fieldConfig) return "";
    for (const line of textLines) {
        const parts = line.split(/:(.*)/s);
        const label = parts[0].trim().toLowerCase();
        const value = parts.length > 1 ? parts[1].trim() : "";

        const matches = stringSimilarity.findBestMatch(label, fieldConfig.labels);
        if (matches.bestMatch.rating > 0.7 && value) {
            return value;
        }
    }
    if (fieldConfig.regex) {
        const fullText = textLines.join('\n');
        const regexMatch = fullText.match(new RegExp(fieldConfig.regex, 'i'));
        if (regexMatch && regexMatch[1]) return regexMatch[1].trim();
    }
    return "";
};

const detectLayout = (text) => {
    const lowerText = text.toLowerCase();
    let bestLayout = 'generic';
    let maxHits = 0;

    for (const [key, config] of Object.entries(LAYOUTS)) {
        if (!config.keywords) continue;
        let hits = 0;
        config.keywords.forEach(word => {
            if (lowerText.includes(word.toLowerCase())) hits++;
        });
        if (hits > maxHits) {
            maxHits = hits;
            bestLayout = key;
        }
    }
    return bestLayout;
};

// --- The API Route ---
router.post('/', upload.single('document'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const filePath = req.file.path;

    try {
       let forcedMode = null;
        if (req.query.layout === 'handwritten_form') {
             forcedMode = 'handwritten';
        }
        const { text: cleanRaw, meta } = await getCleanText(filePath, req.file.mimetype,forcedMode);

        const lines = cleanRaw.split('\n').filter(line => line.trim() !== '');

        const layoutKey = req.query.layout || detectLayout(cleanRaw);
        const activeLayout = LAYOUTS[layoutKey] || LAYOUTS['generic'];

        const extractedFields = {};
        if (activeLayout.fields) {
            for (const [fieldName, config] of Object.entries(activeLayout.fields)) {
                extractedFields[fieldName] = extractField(lines, config);
            }
        }

        res.json({
            success: true,
            layout_used: activeLayout.name,
            quality_scores: meta,
            raw_text: cleanRaw,
            fields: extractedFields
        });

    } catch (error) {
        console.error("Extraction Error:", error);
        res.status(500).json({ error: error.message });
    } finally {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
});module.exports = router;
