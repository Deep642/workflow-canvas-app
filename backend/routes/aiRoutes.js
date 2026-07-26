const express = require('express');
const { generateTaskDesc, searchSimilar, routeDecisionNode, generateAPIPayload, extractImageText } = require('../controllers/aiCtrl');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/generate-task', authMiddleware, generateTaskDesc);
router.post('/search-similar', authMiddleware, searchSimilar);
router.post('/route-decision', authMiddleware, routeDecisionNode);
router.post('/generate-api-payload', authMiddleware, generateAPIPayload);
router.post('/ocr', authMiddleware, extractImageText);

module.exports = router;