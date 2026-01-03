// utils/data_processor.js

function cleanOCRText(text) {
    if (!text) return "";
    return text
        .replace(/\r\n/g, '\n')
        .replace(/\|/g, 'I')
        .trim();
}

function extractStructuredData(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    let extracted = {
        name: null,
        id_number: null,
        address: null,
        email: null
    };

    const idMatch = text.match(/\b\d{10}\b/);
    if (idMatch) {
        extracted.id_number = idMatch[0];
    }

    const emailMatch = text.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/);
    if (emailMatch) {
        extracted.email = emailMatch[0];
    }

    const addressKeywords = ['Address', 'Live', 'Street', 'العنوان', 'شارع', 'حي '];

    for (const line of lines) {
        if (extracted.address) break;

        for (const key of addressKeywords) {
            if (line.includes(key)) {
                let cleanLine = line.replace(key, '').replace(/[:.]/g, '').trim();

                if (cleanLine.length < 3) {
                    const currentIndex = lines.indexOf(line);
                    if (lines[currentIndex + 1]) {
                        extracted.address = lines[currentIndex + 1];
                    }
                } else {
                    extracted.address = cleanLine;
                }
                break;
            }
        }
    }

    // Fallback: If no address found, and we have many lines, usually the last long line is the address
    if (!extracted.address && lines.length > 4) {
        const lastLine = lines[lines.length - 1];
        if (lastLine.length > 10) extracted.address = lastLine;
    }

    return {
        cleaned_text: text,
        extracted: extracted
    };
}

async function optimizeImageForOCR(inputPath, outputPath) {
    try {
        const image = sharp(inputPath);
        const metadata = await image.metadata();

        let pipeline = image.grayscale();

        if (metadata.width < 1000) {
            pipeline = pipeline.resize({ width: 1800, withoutEnlargement: true });
        } else if (metadata.width > 2500) {
            pipeline = pipeline.resize({ width: 2200, withoutEnlargement: true });
        }

        pipeline = pipeline.normalize().gamma(1.1);

        pipeline = pipeline.sharpen({ sigma: 1 });

        await pipeline.png().toFile(outputPath);
        return true;
    } catch (error) {
        console.error(" Preprocessing failed:", error);
        return false;
    }
}

module.exports = { cleanOCRText, extractStructuredData, optimizeImageForOCR };
