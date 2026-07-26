const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '.env') });

const canvasRoutes = require('./routes/canvasRoutes');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
	res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/canvas', canvasRoutes);
app.use('/api/ai', aiRoutes);

app.use((err, _req, res, _next) => {
	// Centralized fallback so API errors are always JSON.
	res.status(err.status || 500).json({
		message: err.message || 'Unexpected server error'
	});
});

const connectAndStart = async () => {
	try {
		if (!process.env.MONGO_URI) {
			throw new Error('MONGO_URI is missing in backend/.env');
		}

		if (!process.env.JWT_SECRET) {
			throw new Error('JWT_SECRET is missing in backend/.env');
		}

		if (!process.env.GROQ_API_KEY) {
			console.warn('⚠️  GROQ_API_KEY is missing - AI features will not work');
		}

		if (!process.env.QDRANT_URL) {
			console.warn('⚠️  QDRANT_URL is missing - Vector DB features will not work');
		}

		await mongoose.connect(process.env.MONGO_URI);
		app.listen(port, () => {
			console.log(`Backend listening on http://localhost:${port}`);
		});
	} catch (error) {
		console.error('Failed to boot backend:', error.message);
		process.exit(1);
	}
};

connectAndStart();
