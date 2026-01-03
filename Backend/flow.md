File (PDF/Image)
│
▼
PDF? ── Yes ── Try pdfParse
│ │
│ └── Success → Clean & return
│
No / Fallback → Convert PDF → PNG
│
▼
Create Grayscale & Normalize (image preprocessing)
│
▼
Tesseract OCR (printed detection)
│
▼
Decision: Printed vs Handwritten
│
├─ Printed → Use Tesseract output
│
└─ Handwritten → TrOCR (optionally strip image) → Raw text
│
▼
Clean OCR text
│
▼
Return { text, raw_text, meta }
