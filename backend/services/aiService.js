const { generateDescription, evaluateDecision, generateApiPayload, extractTextFromImage } = require('./groqService');
const { ensureCollection, storeEmbedding, searchSimilar } = require('./vectorDb');

// Simple embedding generator (using random for now, can be replaced with real embeddings)
const generateEmbedding = (text) => {
  const textHash = text
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const random = Math.sin(textHash) * 10000;
  const seed = random - Math.floor(random);
  
  const embedding = [];
  for (let i = 0; i < 384; i++) {
    const value = Math.sin(seed * (i + 1)) * Math.cos(seed * (i + 2));
    embedding.push(value);
  }
  return embedding;
};

const generateTaskDescription = async (taskTitle, context = '') => {
  try {
    const description = await generateDescription(taskTitle, context);
    const embedding = generateEmbedding(description);
    
    await ensureCollection();
    const pointId = Date.now();
    
    await storeEmbedding(pointId, embedding, {
      type: 'task',
      title: taskTitle,
      description,
      timestamp: new Date().toISOString(),
    });

    return {
      description,
      embedding,
      pointId,
    };
  } catch (error) {
    console.error('AI service error:', error.message);
    throw error;
  }
};

const findSimilarTasks = async (taskDescription) => {
  try {
    await ensureCollection();
    const embedding = generateEmbedding(taskDescription);
    const results = await searchSimilar(embedding, 5);
    
    return results.map((result) => ({
      score: result.score,
      task: result.payload,
    }));
  } catch (error) {
    console.error('Search error:', error.message);
    return [];
  }
};

const routeDecision = async (decisionText, branches) => {
  try {
    const result = await evaluateDecision(decisionText, branches);
    return result;
  } catch (error) {
    console.error('Decision routing error:', error.message);
    throw error;
  }
};

const generateAPI = async (apiDescription, method = 'GET') => {
  try {
    const payload = await generateApiPayload(apiDescription, method);
    return payload;
  } catch (error) {
    console.error('API generation error:', error.message);
    throw error;
  }
};

const extractText = async (imageBase64, mimeType = 'image/png') => {
  try {
    const text = await extractTextFromImage(imageBase64, mimeType);
    return {
      text: text.trim(),
    };
  } catch (error) {
    console.error('OCR error:', error.message);
    throw error;
  }
};

module.exports = {
  generateTaskDescription,
  findSimilarTasks,
  routeDecision,
  generateAPI,
  extractText,
  generateEmbedding,
};