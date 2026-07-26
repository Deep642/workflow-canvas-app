const { generateTaskDescription, findSimilarTasks, routeDecision, generateAPI, extractText } = require('../services/aiService');

const generateTaskDesc = async (req, res, next) => {
  try {
    const { title, context } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const result = await generateTaskDescription(title, context);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

const searchSimilar = async (req, res, next) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'Task description is required' });
    }

    const similar = await findSimilarTasks(description);

    return res.status(200).json({
      success: true,
      similar,
    });
  } catch (error) {
    return next(error);
  }
};

const routeDecisionNode = async (req, res, next) => {
  try {
    const { nodeText, branches } = req.body;

    if (!nodeText || !branches) {
      return res.status(400).json({ message: 'nodeText and branches are required' });
    }

    const result = await routeDecision(nodeText, branches);

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    return next(error);
  }
};

const generateAPIPayload = async (req, res, next) => {
  try {
    const { description, method } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'API description is required' });
    }

    const payload = await generateAPI(description, method || 'GET');

    return res.status(200).json({
      success: true,
      payload,
    });
  } catch (error) {
    return next(error);
  }
};

const extractImageText = async (req, res, next) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ message: 'imageBase64 is required' });
    }

    const result = await extractText(imageBase64, mimeType || 'image/png');

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  generateTaskDesc,
  searchSimilar,
  routeDecisionNode,
  generateAPIPayload,
  extractImageText,
};