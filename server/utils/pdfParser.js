const pdfParse = require('pdf-parse');

const extractTextFromBuffer = async (buffer) => {
  const data = await pdfParse(buffer);
  const text = data.text.trim();
  if (!text) {
    throw new Error('Could not extract text from PDF. The file may be image-based or corrupted.');
  }
  return text;
};

module.exports = { extractTextFromBuffer };
