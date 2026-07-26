const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const createChatCompletion = async (prompt, maxTokens = 150) => {
  if (!groq || !groq.chat || !groq.chat.completions || typeof groq.chat.completions.create !== 'function') {
    throw new Error('Groq SDK chat client is unavailable');
  }

  const response = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    max_tokens: maxTokens,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const text = response?.choices?.[0]?.message?.content || '';
  return typeof text === 'string' ? text : JSON.stringify(text);
};

const generateDescription = async (title, context = '') => {
  try {
    const prompt = `
You are an expert workflow assistant. Given a task title and optional context, generate a clear, concise, and actionable description.

Task Title: "${title}"
Context: ${context || 'None provided'}

Generate a professional task description (max 200 characters) that:
1. Is specific and actionable
2. Uses clear, simple language
3. Includes any necessary details
4. Avoids jargon

Return ONLY the description text, nothing else.
    `.trim();

    const result = await createChatCompletion(prompt, 150);
    return result.trim();
  } catch (error) {
    console.error('Groq error:', error.message);
    throw error;
  }
};

const evaluateDecision = async (nodeText, branches) => {
  try {
    const branchList = branches.map((b, i) => `${i + 1}. ${b}`).join('\n');
    const prompt = `
You are a decision router for workflow automation.

Decision Point: "${nodeText}"

Available branches:
${branchList}

Based on the decision description, which branch is most appropriate? Return ONLY the number (1, 2, 3, etc.) of the best branch.
    `.trim();

    const result = await createChatCompletion(prompt, 10);
    const branchIndex = parseInt(result.trim()) - 1;

    return {
      selectedBranch: branchIndex >= 0 && branchIndex < branches.length ? branchIndex : 0,
      reasoning: result.trim(),
    };
  } catch (error) {
    console.error('Groq decision error:', error.message);
    throw error;
  }
};

const generateApiPayload = async (apiDescription, method = 'GET') => {
  try {
    const prompt = `
You are a REST API expert. Given a description of an API call, generate a JSON payload example.

API Description: "${apiDescription}"
HTTP Method: ${method}

Generate a realistic example payload. Return ONLY valid JSON, no explanation.
If GET request, return query parameters. If POST/PUT, return request body.
    `.trim();

    const result = await createChatCompletion(prompt, 300);
    return JSON.parse(result.trim());
  } catch (error) {
    console.error('Groq payload generation error:', error.message);
    return { error: 'Could not generate payload', details: error.message };
  }
};

const extractTextFromImage = async (imageBase64, mimeType = 'image/png') => {
  try {
    if (!groq || !groq.chat || !groq.chat.completions || typeof groq.chat.completions.create !== 'function') {
      throw new Error('Groq SDK chat client is unavailable');
    }

    const response = await groq.chat.completions.create({
      model: process.env.GROQ_IMAGE_MODEL || 'llama-3.2-11b-vision-preview',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract all visible text from this image. Return only the text, preserving line breaks. If no text is visible, return NO_TEXT_FOUND.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
    });

    const text = response?.choices?.[0]?.message?.content || '';
    return typeof text === 'string' ? text : JSON.stringify(text);
  } catch (error) {
    console.error('Groq OCR error:', error.message);
    throw error;
  }
};

module.exports = {
  generateDescription,
  evaluateDecision,
  generateApiPayload,
  extractTextFromImage,
};
