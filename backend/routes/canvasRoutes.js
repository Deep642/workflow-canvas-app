const express = require('express');
const {
	listCanvases,
	getLatestCanvas,
	getCanvasById,
	saveCanvas,
	renameCanvas,
	deleteCanvas,
	setShareToken,
	getSharedCanvas,
	exportCanvas,
	importCanvas
} = require('../controllers/canvasCtrl');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/share/:token', getSharedCanvas);
router.use(requireAuth);
router.get('/library', listCanvases);
router.get('/', getLatestCanvas);
router.get('/:id', getCanvasById);
router.post('/', saveCanvas);
router.post('/import', importCanvas);
router.get('/:id/export', exportCanvas);
router.post('/:id/share', setShareToken);
router.patch('/:id/rename', renameCanvas);
router.delete('/:id', deleteCanvas);

module.exports = router;
