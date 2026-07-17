const mongoose = require('mongoose');

const CanvasSchema = new mongoose.Schema({
	owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
	name: { type: String, required: true, trim: true },
	nodes: { type: Array, required: true, default: [] },
	edges: { type: Array, required: true, default: [] },
	shareToken: { type: String, default: null, index: true },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Canvas', CanvasSchema);
