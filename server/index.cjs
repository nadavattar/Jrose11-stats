const express = require('express');
const path = require('path');
const cors = require('cors'); // Use cors package
require('dotenv').config();
const connectDB = require('./db.cjs');

// Import models
const Pokemon = require('./models/Pokemon.cjs');
const RunStatistics = require('./models/RunStatistics.cjs');
const User = require('./models/User.cjs');
const TierPlacement = require('./models/TierPlacement.cjs');
const Move = require('./models/Move.cjs');
const RulesContent = require('./models/RulesContent.cjs');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors()); // Use standard CORS middleware

// Entity Model Mapping
const models = {
    Pokemon,
    RunStatistics,
    User,
    TierPlacement,
    Move,
    RulesContent
};

// Mock authentication endpoints
app.get('/api/apps/public/prod/public-settings/by-id/:appId', (req, res) => {
    res.json({
        id: req.params.appId,
        public_settings: {
            requires_auth: false,
            name: 'Jrose 11 Stats Hub'
        }
    });
});

// Database Diagnostic Endpoint
app.get('/api/diag/db', async (req, res) => {
    try {
        const status = mongoose.connection.readyState;
        const statusNames = ['disconnected', 'connected', 'connecting', 'disconnecting'];

        const pokemonCount = await Pokemon.countDocuments();
        const statsCount = await RunStatistics.countDocuments();
        const dbName = mongoose.connection.name;

        res.json({
            connection: statusNames[status] || 'unknown',
            database: dbName,
            counts: {
                Pokemon: pokemonCount,
                RunStatistics: statsCount
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Authentication endpoint
app.post('/api/auth/login', (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (password === adminPassword) {
        return res.json({ success: true, role: 'admin' });
    }

    return res.status(401).json({ success: false, error: 'Invalid password' });
});

app.get('/api/apps/:appId/entities/User/me', async (req, res) => {
    // Default to guest/viewer role unless otherwise specified
    // In a real app, we would verify a token here.
    res.json({
        id: 'mock-user-1',
        email: 'viewer@local.dev',
        name: 'Viewer',
        role: 'viewer',
        created_at: new Date().toISOString()
    });
});

// List entities with query param filtering support
app.get('/api/apps/:appId/entities/:entityName', async (req, res) => {
    const entityName = req.params.entityName;
    const Model = models[entityName];

    if (!Model) {
        return res.status(404).json({ error: 'Entity not found' });
    }

    try {
        const filters = { ...req.query };
        const reservedParams = ['_sort', '_limit', '_order', '_skip', 'sort', 'limit', 'skip', 'q', 'fields'];
        reservedParams.forEach(p => delete filters[p]);

        // Handle SDK's JSON filter query param
        if (req.query.q) {
            try {
                const qFilter = JSON.parse(req.query.q);
                Object.assign(filters, qFilter);
            } catch (e) {
                // ignore malformed q param
            }
        }

        let query = Model.find(filters);

        // Handle sort
        const sortKey = req.query.sort || req.query._sort;
        if (sortKey) {
            query = query.sort({ [sortKey]: 1 }); // Default to ascending
        }

        // Handle limit
        const limitVal = req.query.limit || req.query._limit;
        if (limitVal) {
            query = query.limit(parseInt(limitVal, 10));
        }

        const data = await query.exec();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single entity by ID
app.get('/api/apps/:appId/entities/:entityName/:id', async (req, res) => {
    const { entityName, id } = req.params;
    const Model = models[entityName];

    if (!Model) {
        return res.status(404).json({ error: 'Entity not found' });
    }

    try {
        const item = await Model.findOne({ id: id }); // Use custom id field
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create entity
app.post('/api/apps/:appId/entities/:entityName', async (req, res) => {
    const entityName = req.params.entityName;
    const Model = models[entityName];

    if (!Model) {
        return res.status(404).json({ error: 'Entity not found' });
    }

    try {
        const newItemData = {
            id: String(Date.now()), // Generate simple ID if not provided, though Mongo has _id
            ...req.body
        };
        // Ensure ID uniqueness conflict handling? 
        // For now relying on timestamp id not colliding for low volume

        const newItem = new Model(newItemData);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update entity (full replace/update)
app.put('/api/apps/:appId/entities/:entityName/:id', async (req, res) => {
    const { entityName, id } = req.params;
    const Model = models[entityName];

    if (!Model) {
        return res.status(404).json({ error: 'Entity not found' });
    }

    try {
        const updatedItem = await Model.findOneAndUpdate({ id: id }, req.body, { new: true });
        if (!updatedItem) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(updatedItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update entity (partial)
app.patch('/api/apps/:appId/entities/:entityName/:id', async (req, res) => {
    const { entityName, id } = req.params;
    const Model = models[entityName];

    if (!Model) {
        return res.status(404).json({ error: 'Entity not found' });
    }

    try {
        const updatedItem = await Model.findOneAndUpdate({ id: id }, { $set: req.body }, { new: true });
        if (!updatedItem) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(updatedItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete entity
app.delete('/api/apps/:appId/entities/:entityName/:id', async (req, res) => {
    const { entityName, id } = req.params;
    const Model = models[entityName];

    if (!Model) {
        return res.status(404).json({ error: 'Entity not found' });
    }

    try {
        const result = await Model.findOneAndDelete({ id: id });
        if (!result) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// The "catchall" handler
app.use((req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }

    if (req.method === 'GET') {
        const indexPath = path.join(__dirname, '../dist/index.html');
        if (require('fs').existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.status(404).send('Build not found. Please run build script.');
        }
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API running at http://localhost:${PORT}`);
});
