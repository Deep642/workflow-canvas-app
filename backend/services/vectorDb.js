const axios = require('axios');

const COLLECTION_NAME = 'workflow_tasks';
const EMBEDDING_DIM = 384;

let qdrantClient = null;

const initQdrant = async () => {
  if (qdrantClient) return qdrantClient;

  qdrantClient = axios.create({
    baseURL: process.env.QDRANT_URL,
    headers: {
      'api-key': process.env.QDRANT_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  return qdrantClient;
};

const ensureCollection = async () => {
  const client = await initQdrant();

  try {
    // Check if collection exists
    await client.get('/collections/' + COLLECTION_NAME);
  } catch (error) {
    if (error.response?.status === 404) {
      // Create collection
      await client.put('/collections/' + COLLECTION_NAME, {
        vectors: {
          size: EMBEDDING_DIM,
          distance: 'Cosine',
        },
      });
      console.log('Qdrant collection created:', COLLECTION_NAME);
    }
  }
};

const storeEmbedding = async (pointId, embedding, payload) => {
  const client = await initQdrant();

  await client.put('/collections/' + COLLECTION_NAME + '/points', {
    points: [
      {
        id: pointId,
        vector: embedding,
        payload,
      },
    ],
  });
};

const searchSimilar = async (embedding, limit = 5) => {
  const client = await initQdrant();

  const response = await client.post(
    '/collections/' + COLLECTION_NAME + '/points/search',
    {
      vector: embedding,
      limit,
      score_threshold: 0.7,
    }
  );

  return response.data.result || [];
};

module.exports = {
  initQdrant,
  ensureCollection,
  storeEmbedding,
  searchSimilar,
  COLLECTION_NAME,
};