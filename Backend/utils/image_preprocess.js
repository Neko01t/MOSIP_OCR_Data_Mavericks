// utils/image_preprocess.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const TEMP_DIR = path.join(__dirname, '../temp_crops');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

function log(step, msg) { console.log(`[PREPROCESS] [${step}] ${msg}`); }

/**
 * Creates a safe grayscale + normalized image
 * @param {string} inputPath - Original image path
 * @param {number} maxWidth - Optional resize width
 */
async function createSafeGrayscale(inputPath, maxWidth = 1600) {
    const outputPath = path.join(TEMP_DIR, `mono_${Date.now()}.png`);
    try {
        log("PREP", "Creating safe grayscale copy...");
        await sharp(inputPath, { failOnError: false })
            .grayscale()
            .resize({ width: maxWidth })
            .normalize()
            .png()
            .toFile(outputPath);
        return outputPath;
    } catch (e) {
        log("PREP_FAIL", e.message);
        return inputPath;
    }
}

/**
 * Splits an image into horizontal strips
 * @param {string} imagePath - Path to preprocessed image
 * @param {number} stripHeight - Height of each strip
 * @param {number} overlap - Overlap between strips
 * @returns {string[]} - Array of strip file paths
 */

async function sliceIntoStrips(imagePath, stripHeight = 400, overlap = 50) {
    const baseImage = sharp(imagePath, { failOnError: false });
    const metadata = await baseImage.metadata();
    const strips = [];

    if (!metadata.height || !metadata.width) {
        throw new Error("Invalid image metadata");
    }

    let y = 0, idx = 0;

    while (y < metadata.height) {
        const actualHeight = Math.min(stripHeight, metadata.height - y);

        if (actualHeight < 64) break;

        const stripPath = path.join(
            TEMP_DIR,
            `strip_${Date.now()}_${idx}.png`
        );

        await sharp(imagePath, { failOnError: false })
            .extract({
                left: 0,
                top: y,
                width: metadata.width,
                height: actualHeight
            })
            .toColourspace('rgb')
            .png()
            .toFile(stripPath);

        strips.push(stripPath);

        y += (stripHeight - overlap);
        idx++;
    }

    return strips;
}

module.exports = { createSafeGrayscale, sliceIntoStrips };
