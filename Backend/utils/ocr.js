// utils/ocr.js
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-extraction');
const Tesseract = require('tesseract.js');
const { pdfToPng } = require('pdf-to-png-converter');
const { cleanOCRText } = require('./data_processor');
const { createSafeGrayscale, sliceIntoStrips } = require('./image_preprocess');

function log(step, msg) { console.log(`[OCR] [${step}] ${msg}`); }

const PRINTED_KEYWORDS = [
    'identity', 'card', 'republic', 'government', 'name', 'id', 'dob',
    'national', 'state', 'district', 'permanent', 'account', 'number',
    'father', 'gender', 'date of birth', 'valid', 'issue', 'expiry',
    'income', 'tax'
];

let handwritingPipeline = null;

async function getHandwritingModel() {
    if (!handwritingPipeline) {
        log("MODEL", "Loading TrOCR base handwritten model...");
        const { pipeline, env } = await import('@xenova/transformers');
        env.cacheDir = path.join(__dirname, '../models_cache');
        env.allowLocalModels = false;
        handwritingPipeline = await pipeline('image-to-text', 'Xenova/trocr-small-handwritten', {
            progress_callback: (data) => {
                if (data.status === 'progress') log("MODEL", `${data.file}: ${Math.round(data.progress)}%`);
            }
        });
        log("MODEL", "Handwriting model ready!");
    }
    return handwritingPipeline;
}

async function processFullImageWithStrips(imagePath, recognizer) {
    const strips = await sliceIntoStrips(imagePath, 400, 50);

    if (!Array.isArray(strips) || strips.length === 0) {
        throw new Error("No strips generated");
    }

    let finalText = "";

    for (let i = 0; i < strips.length; i++) {
        const strip = strips[i];
        try {
            if (!fs.existsSync(strip)) {
                log("STRIP_MISSING", strip);
                continue;
            }

            const stat = fs.statSync(strip);
            if (stat.size < 5000) {
                log("STRIP_EMPTY", strip);
                continue;
            }

            log("STRIP_OCR", `Processing strip ${i + 1}/${strips.length}`);

            const result = await recognizer(strip);

            if (result?.[0]?.generated_text) {
                finalText += result[0].generated_text.trim() + "\n";
            }
        } catch (e) {
            log("STRIP_FAIL", `${strip}: ${e.message}`);
        } finally {
            fs.existsSync(strip) && fs.unlinkSync(strip);
        }
    }

    return finalText.trim();
}

async function getCleanText(filePath, mimeType, forcedMode = null) {
    const safePath = path.resolve(filePath);
    let workingPath = safePath;
    let tempFile = null;

    // PDF handling
    if (mimeType === 'application/pdf') {
        try {
            const data = await pdfParse(fs.readFileSync(safePath));
            if (data.text.trim().length > 50) {
                return { text: cleanOCRText(data.text), raw_text: data.text, meta: { ocr_confidence: 100, model_used: 'pdf_embedded' } };
            }
            log("PDF", "Converting scanned PDF to image...");
            const pngPages = await pdfToPng(safePath, { viewportScale: 2.0, outputFolder: path.join(__dirname, '../temp_crops'), outputFileMaskFunc: n => `page_${Date.now()}_${n}.png` });
            if (pngPages.length > 0) {
                const result = await getCleanText(pngPages[0].path, 'image/png', forcedMode);
                fs.unlinkSync(pngPages[0].path);
                return result;
            }
        } catch (e) { return { text: "", raw_text: "", meta: { error: "PDF Failed" } }; }
    }

    // Grayscale + preprocessing
    workingPath = await createSafeGrayscale(safePath);
    const trOCRPath = safePath;
    if (workingPath !== safePath) tempFile = workingPath;

    // Tesseract for printed detection
    const detectionBuffer = await fs.promises.readFile(workingPath);
    const tessResult = await Tesseract.recognize(detectionBuffer, 'eng+hin', { logger: m => { } });
    const tessText = tessResult.data.text || "";
    const lines = tessResult.data.lines || [];
    const tessConf = tessResult.data.confidence || 50;

    const lowerText = tessText.toLowerCase();
    const keywordCount = PRINTED_KEYWORDS.filter(k => lowerText.includes(k)).length;
    const lowConfLines = lines.filter(l => l.confidence < 70).length;
    const isMessy = lines.length > 0 && (lowConfLines / lines.length > 0.3);

    let isPrinted = (keywordCount >= 2 && tessConf > 80) || tessConf > 90;
    if (isMessy && tessConf < 85) isPrinted = false;
    if (forcedMode === 'handwritten') isPrinted = false;
    if (forcedMode === 'printed') isPrinted = true;

    log("DECISION", `${isPrinted ? 'PRINTED' : 'HANDWRITTEN'} (Conf: ${Math.round(tessConf)}%, Lines: ${lines.length})`);

    let rawText = tessText;
    let usedModel = 'printed';
    let confidence = tessConf;

    if (!isPrinted) {
        try {
            const recognizer = await getHandwritingModel();
            usedModel = 'hybrid_ai';
            rawText = (await recognizer(trOCRPath))[0].generated_text;
            //rawText = await processFullImageWithStrips(trOCRPath, recognizer);
            confidence = 85;
        } catch (e) {
            log("AI_FAIL", e.message);
        }
    }

    if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile);

    return { text: cleanOCRText(rawText), raw_text: rawText, meta: { ocr_confidence: confidence, model_used: usedModel, image_quality: { score: 100, rating: "Good", issues: [] } } };
}

getHandwritingModel().catch(e => log("MODEL_WAIT", "Waiting for first request..."));

module.exports = { getCleanText };

