const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const parseGeminiJSON = (raw) => {
  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Gemini returned malformed JSON. Please try again.');
  }
};

const analyzeResume = async (resumeText) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `You are an ATS and technical recruiter. Analyze this resume for software engineering placements. Respond with ONLY valid JSON, no markdown: {"score": <0-100 int>, "missingSkills": [string], "weakSections": [string], "suggestions": [string]}

Resume:
${resumeText}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseGeminiJSON(text);
};

const analyzeJobMatch = async (resumeText, jobDescription) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `Compare this resume against this job description. Respond with ONLY valid JSON, no markdown: {"matchScore": <0-100 int>, "missingSkills": [string], "strengths": [string], "suggestions": [string]}

Resume:
${resumeText}

Job Description:
${jobDescription}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseGeminiJSON(text);
};

module.exports = { analyzeResume, analyzeJobMatch };
