const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-App-Id');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Load database from separate files
const dataDir = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Bug 1 Fix: In-memory cache — read each file once, invalidate on writes
const entityCache = {};

const loadEntity = (entityName) => {
    if (entityCache[entityName]) {
        return entityCache[entityName];
    }
    const filePath = path.join(dataDir, `${entityName}.json`);
    if (fs.existsSync(filePath)) {
        entityCache[entityName] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return entityCache[entityName];
    }
    return [];
};

const saveEntity = (entityName, data) => {
    const filePath = path.join(dataDir, `${entityName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    // Invalidate cache on write
    entityCache[entityName] = data;
};

// Mock authentication endpoints
app.get('/api/apps/public/prod/public-settings/by-id/:appId', (req, res) => {
    res.json({
        id: req.params.appId,
        public_settings: {
            requires_auth: false,
            name: 'Jrose 11 Stats Hub (Local)'
        }
    });
});

// Authentication endpoint
app.post('/api/auth/login', (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'; // Default for dev/demo

    if (password === adminPassword) {
        return res.json({ success: true, role: 'admin' });
    }

    return res.status(401).json({ success: false, error: 'Invalid password' });
});

app.get('/api/apps/:appId/entities/User/me', (req, res) => {
    const users = loadEntity('User');
    // Default to guest/viewer role unless otherwise specified
    res.json(users[0] || {
        id: 'mock-user-1',
        email: 'viewer@local.dev',
        name: 'Viewer',
        role: 'viewer', // Changed from 'admin' to 'viewer'
        created_at: new Date().toISOString()
    });
});

// Bug 3 Fix: List entities with query param filtering support
app.get('/api/apps/:appId/entities/:entityName', (req, res) => {
    const entityName = req.params.entityName;
    let data = loadEntity(entityName);

    // SDK sends: ?q={"field":"value"} for filter(), ?sort=field&limit=N for list()
    // Our tests use: ?field=value&_sort=field&_limit=N
    const filters = { ...req.query };

    // Remove all non-field params
    const reservedParams = ['_sort', '_limit', '_order', '_skip', 'sort', 'limit', 'skip', 'q', 'fields'];
    reservedParams.forEach(p => delete filters[p]);

    // Handle SDK's JSON filter query param: ?q={"pokemon_id":"abc123"}
    if (req.query.q) {
        try {
            const qFilter = JSON.parse(req.query.q);
            Object.assign(filters, qFilter);
        } catch (e) {
            // ignore malformed q param
        }
    }

    // Apply field filters
    if (Object.keys(filters).length > 0) {
        data = data.filter(item =>
            Object.entries(filters).every(([key, value]) =>
                String(item[key]) === String(value)
            )
        );
    }

    // Handle sort param (SDK uses 'sort', our tests use '_sort')
    const sortKey = req.query.sort || req.query._sort;
    if (sortKey) {
        data = [...data].sort((a, b) => {
            if (a[sortKey] < b[sortKey]) return -1;
            if (a[sortKey] > b[sortKey]) return 1;
            return 0;
        });
    }

    // Handle limit param (SDK uses 'limit', our tests use '_limit')
    const limitVal = req.query.limit || req.query._limit;
    if (limitVal) {
        data = data.slice(0, parseInt(limitVal, 10));
    }

    res.json(data);
});


// Get single entity by ID
app.get('/api/apps/:appId/entities/:entityName/:id', (req, res) => {
    const { entityName, id } = req.params;
    const data = loadEntity(entityName);
    const item = data.find(item => item.id === id);

    if (!item) {
        return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
});

// Create entity
app.post('/api/apps/:appId/entities/:entityName', (req, res) => {
    const entityName = req.params.entityName;
    const data = loadEntity(entityName);

    const newItem = {
        id: String(Date.now()),
        ...req.body
    };

    data.push(newItem);
    saveEntity(entityName, data);
    res.status(201).json(newItem);
});

// Update entity (full replace)
app.put('/api/apps/:appId/entities/:entityName/:id', (req, res) => {
    const { entityName, id } = req.params;
    const data = loadEntity(entityName);
    const index = data.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Item not found' });
    }

    data[index] = { ...data[index], ...req.body };
    saveEntity(entityName, data);
    res.json(data[index]);
});

// Update entity (partial)
app.patch('/api/apps/:appId/entities/:entityName/:id', (req, res) => {
    const { entityName, id } = req.params;
    const data = loadEntity(entityName);
    const index = data.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Item not found' });
    }

    data[index] = { ...data[index], ...req.body };
    saveEntity(entityName, data);
    res.json(data[index]);
});

// Delete entity
app.delete('/api/apps/:appId/entities/:entityName/:id', (req, res) => {
    const { entityName, id } = req.params;
    const data = loadEntity(entityName);
    const index = data.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Item not found' });
    }

    data.splice(index, 1);
    saveEntity(entityName, data);
    res.status(204).send();
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.use((req, res) => {
    // 1. Explicitly 404 for API requests that didn't match any route
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }

    // 2. Serve index.html for non-API GET requests (client-side routing)
    if (req.method === 'GET') {
        const indexPath = path.join(__dirname, '../dist/index.html');
        // Check if file exists to prevent crashing (especially in pure dev mode without build)
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.status(404).send('Build not found. If you are in development, use the Vite dev server (port 5173).');
        }
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Local Base44 Mock API running at http://localhost:${PORT}`);
    console.log(`📦 Data directory: ${dataDir}`);
    console.log(`✅ Authentication bypassed - no login required!`);
});
