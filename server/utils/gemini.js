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

const chatWithPlacementBuddy = async (company, resumeText, history, newMessage) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const systemContext = `You are a placement prep assistant for software engineering interviews. The user is targeting ${company}. Their resume:\n${resumeText}\n\nAnswer their questions specifically using this context. Be concise, practical, and helpful.`;

  const geminiHistory = [];
  for (let i = 0; i < history.length; i++) {
    const msg = history[i];
    let text = msg.message;
    if (i === 0 && msg.role === 'user') {
      text = `${systemContext}\n\nUser question: ${text}`;
    }
    geminiHistory.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text }],
    });
  }

  const chat = model.startChat({ history: geminiHistory });

  const messageToSend = history.length === 0
    ? `${systemContext}\n\nUser question: ${newMessage}`
    : newMessage;

  const result = await chat.sendMessage(messageToSend);
  return result.response.text().trim();
};

module.exports = { analyzeResume, analyzeJobMatch, chatWithPlacementBuddy };
