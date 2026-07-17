const mongoose = require('mongoose');
const crypto = require('crypto');
const Canvas = require('../models/Canvas');

const normalizePayload = (body = {}) => {
	const name = typeof body.name === 'string' && body.name.trim()
		? body.name.trim()
		: 'default-workflow';

	return {
		id: body.id,
		name,
		nodes: Array.isArray(body.nodes) ? body.nodes : [],
		edges: Array.isArray(body.edges) ? body.edges : []
	};
};

const validateCanvasId = (id, res) => {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		res.status(400).json({ message: 'Invalid canvas id' });
		return false;
	}

	return true;
};

const canvasLibraryProjection = {
	name: 1,
	updatedAt: 1,
	createdAt: 1,
	nodes: 1,
	edges: 1,
	shareToken: 1
};

const toLibraryItem = (canvas) => ({
	_id: canvas._id,
	name: canvas.name,
	updatedAt: canvas.updatedAt,
	createdAt: canvas.createdAt,
	nodeCount: Array.isArray(canvas.nodes) ? canvas.nodes.length : 0,
	edgeCount: Array.isArray(canvas.edges) ? canvas.edges.length : 0,
	shared: Boolean(canvas.shareToken)
});

const listCanvases = async (req, res, next) => {
	try {
		const canvases = await Canvas.find({ owner: req.userId }, canvasLibraryProjection)
			.sort({ updatedAt: -1 })
			.lean();

		const library = canvases.map(toLibraryItem);

		return res.status(200).json(library);
	} catch (error) {
		return next(error);
	}
};

const getLatestCanvas = async (req, res, next) => {
	try {
		const canvas = await Canvas.findOne({ owner: req.userId }).sort({ updatedAt: -1 }).lean();

		if (!canvas) {
			return res.status(200).json({
				name: 'default-workflow',
				nodes: [],
				edges: []
			});
		}

		return res.status(200).json(canvas);
	} catch (error) {
		return next(error);
	}
};

const getCanvasById = async (req, res, next) => {
	try {
		const { id } = req.params;

		if (!validateCanvasId(id, res)) {
			return;
		}

		const canvas = await Canvas.findOne({ _id: id, owner: req.userId }).lean();
		if (!canvas) {
			return res.status(404).json({ message: 'Canvas not found' });
		}

		return res.status(200).json(canvas);
	} catch (error) {
		return next(error);
	}
};

const saveCanvas = async (req, res, next) => {
	try {
		const payload = normalizePayload(req.body);
		let saved;

		if (payload.id && mongoose.Types.ObjectId.isValid(payload.id)) {
			saved = await Canvas.findOneAndUpdate(
				{ _id: payload.id, owner: req.userId },
				{
					name: payload.name,
					nodes: payload.nodes,
					edges: payload.edges,
					updatedAt: Date.now()
				},
				{ new: true }
			);
		}

		if (!saved) {
			saved = await Canvas.create({
				owner: req.userId,
				name: payload.name,
				nodes: payload.nodes,
				edges: payload.edges,
				createdAt: Date.now(),
				updatedAt: Date.now()
			});
		}

		return res.status(200).json(saved);
	} catch (error) {
		return next(error);
	}
};

const renameCanvas = async (req, res, next) => {
	try {
		const { id } = req.params;
		const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';

		if (!validateCanvasId(id, res)) {
			return;
		}

		if (!name) {
			return res.status(400).json({ message: 'A non-empty name is required' });
		}

		const updated = await Canvas.findOneAndUpdate(
			{ _id: id, owner: req.userId },
			{ name, updatedAt: Date.now() },
			{ new: true }
		);

		if (!updated) {
			return res.status(404).json({ message: 'Canvas not found' });
		}

		return res.status(200).json(updated);
	} catch (error) {
		return next(error);
	}
};

const deleteCanvas = async (req, res, next) => {
	try {
		const { id } = req.params;

		if (!validateCanvasId(id, res)) {
			return;
		}

		const deleted = await Canvas.findOneAndDelete({ _id: id, owner: req.userId });
		if (!deleted) {
			return res.status(404).json({ message: 'Canvas not found' });
		}

		return res.status(200).json({ message: 'Canvas deleted' });
	} catch (error) {
		return next(error);
	}
};

const setShareToken = async (req, res, next) => {
	try {
		const { id } = req.params;

		if (!validateCanvasId(id, res)) {
			return;
		}

		const shouldShare = req.body?.enabled !== false;
		const shareToken = shouldShare ? crypto.randomBytes(16).toString('hex') : null;

		const canvas = await Canvas.findOneAndUpdate(
			{ _id: id, owner: req.userId },
			{ shareToken, updatedAt: Date.now() },
			{ new: true }
		).lean();

		if (!canvas) {
			return res.status(404).json({ message: 'Canvas not found' });
		}

		return res.status(200).json({
			_id: canvas._id,
			shareToken: canvas.shareToken,
			shareUrl: canvas.shareToken ? `${req.protocol}://${req.get('host')}/api/canvas/share/${canvas.shareToken}` : null
		});
	} catch (error) {
		return next(error);
	}
};

const getSharedCanvas = async (req, res, next) => {
	try {
		const { token } = req.params;
		const canvas = await Canvas.findOne({ shareToken: token }).lean();

		if (!canvas) {
			return res.status(404).json({ message: 'Shared canvas not found' });
		}

		return res.status(200).json({
			_id: canvas._id,
			name: canvas.name,
			nodes: canvas.nodes,
			edges: canvas.edges,
			updatedAt: canvas.updatedAt,
			shared: true
		});
	} catch (error) {
		return next(error);
	}
};

const exportCanvas = async (req, res, next) => {
	try {
		const { id } = req.params;

		if (!validateCanvasId(id, res)) {
			return;
		}

		const canvas = await Canvas.findOne({ _id: id, owner: req.userId }).lean();
		if (!canvas) {
			return res.status(404).json({ message: 'Canvas not found' });
		}

		return res.status(200).json({
			version: 1,
			type: 'workflow-canvas-export',
			exportedAt: new Date().toISOString(),
			canvas: {
				name: canvas.name,
				nodes: canvas.nodes,
				edges: canvas.edges
			}
		});
	} catch (error) {
		return next(error);
	}
};

const importCanvas = async (req, res, next) => {
	try {
		const source = req.body?.canvas || req.body;
		const payload = normalizePayload(source);

		const created = await Canvas.create({
			owner: req.userId,
			name: payload.name,
			nodes: payload.nodes,
			edges: payload.edges,
			createdAt: Date.now(),
			updatedAt: Date.now()
		});

		return res.status(201).json(created);
	} catch (error) {
		return next(error);
	}
};

module.exports = {
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
};
