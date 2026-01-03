// routes/verification.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { getCleanText } = require('../utils/ocr');

const upload = multer({ dest: 'uploads/' });

// --- HELPER FUNCTIONS ---

// 1. Similarity Logic (Levenshtein based)
function getSimilarity(s1, s2) {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) { longer = s2; shorter = s1; }
    const longerLength = longer.length;
    if (longerLength === 0) return 1.0;

    const editDistance = (function(s1, s2) {
        s1 = s1.toLowerCase(); s2 = s2.toLowerCase();
        let costs = new Array();
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i == 0) costs[j] = j;
                else {
                    if (j > 0) {
                        let newValue = costs[j - 1];
                        if (s1.charAt(i - 1) != s2.charAt(j - 1)) newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    })(longer, shorter);

    return (longerLength - editDistance) / longerLength;
}

// 2. Date Normalization (DD/MM/YYYY -> YYYY-MM-DD)
// We run this BEFORE removing punctuation so we can catch the slashes/dashes
function normalizeDates(text) {
    if (!text) return "";
    // Matches DD/MM/YYYY or DD-MM-YYYY and converts to YYYY-MM-DD
    return text.replace(/\b(\d{2})[\/\-](\d{2})[\/\-](\d{4})\b/g, '$3-$2-$1');
}

// 3. General Text Normalization
function normalizeString(text) {
    if (!text) return "";
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove punctuation but keep dashes (for dates) and alphanumeric
        .replace(/\s+/g, ' ')     // Collapse multiple spaces
        .trim();
}

// --- ROUTE ---

router.post('/', upload.single('document'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const filePath = req.file.path;

    try {
        const { text } = await getCleanText(filePath, req.file.mimetype);

        const safeText = text || "";

        // Step 1: Normalize Dates in the OCR text first
        const dateNormalizedText = normalizeDates(safeText);

        // Step 2: Clean up punctuation and spacing
        const cleanOCRText = normalizeString(dateNormalizedText);

        const verificationResults = {};

        for (const [key, userValue] of Object.entries(req.body)) {
            if (key === 'document') continue;

            let valStr = String(userValue).trim();
            if (!valStr) continue;

            // Normalize user input similarly
            valStr = normalizeDates(valStr);
            const cleanUserValue = normalizeString(valStr);

            // 1. Exact Match Check
            const exactMatch = cleanOCRText.includes(cleanUserValue);
            let confidence = exactMatch ? 1.0 : 0.0;

            // 2. Fuzzy Match Check (if no exact match)
            if (!exactMatch) {
                const words = cleanOCRText.split(' ');
                const relevantWords = words.filter(w => Math.abs(w.length - cleanUserValue.length) < 3);

                relevantWords.forEach(word => {
                   const score = getSimilarity(word, cleanUserValue);
                   if (score > confidence) confidence = score;
                });
            }

            // 3. Determine Categorical Status
            let status = 'MISMATCH';
            if (confidence >= 0.9) {
                status = 'MATCH';
            } else if (confidence >= 0.7) {
                status = 'PARTIAL_MATCH';
            }

            verificationResults[key] = {
                submitted_value: userValue,
                normalized_value: cleanUserValue,
                status: status,
                match_confidence: parseFloat(confidence.toFixed(2))
            };
        }

        res.json({ success: true, verification: verificationResults });

    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ error: error.message });
    } finally {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
});

module.exports = router;
