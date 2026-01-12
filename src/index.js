// Main Application Entry Point
const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const docLibService = require('./services/docLibService');
const tokenService = require('./services/tokenService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        message: 'Mass Trim Opener API çalışıyor',
        timestamp: new Date().toISOString(),
        environment: config.env,
        tenant: config.plm.tenant,
        schema: config.plm.schema
    });
});

// Detailed health check with token info
app.get('/health/detailed', async (req, res) => {
    const tokenInfo = tokenService.getTokenInfo();
    
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            api: {
                status: 'healthy',
                uptime_seconds: process.uptime()
            },
            plm: {
                status: 'configured',
                tenant: config.plm.tenant,
                schema: config.plm.schema,
                userId: config.plm.userId,
                token_status: tokenInfo.isValid ? 'valid' : 'expired',
                token_expires_at: tokenInfo.expiresAt
            }
        }
    });
});

// Get DocLib data endpoint
app.post('/api/doclib/get', async (req, res) => {
    try {
        const { DocLibId } = req.body;
        
        if (!DocLibId) {
            return res.status(400).json({
                success: false,
                error: 'DocLibId is required'
            });
        }
        
        console.log(`\n📥 Received request for DocLibId: ${DocLibId}`);
        
        const result = await docLibService.getDocLibData(DocLibId);
        
        res.json(result);
        
    } catch (error) {
        console.error('❌ Error in /api/doclib/get:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║   Mass Trim Opener API Server                ║');
    console.log('╚════════════════════════════════════════════════╝\n');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${config.env}`);
    console.log(`🏢 Tenant: ${config.plm.tenant}`);
    console.log(`📋 Schema: ${config.plm.schema}`);
    console.log(`\n📡 Endpoints:`);
    console.log(`   GET  http://localhost:${PORT}/health`);
    console.log(`   GET  http://localhost:${PORT}/health/detailed`);
    console.log(`   POST http://localhost:${PORT}/api/doclib/get`);
    console.log('\n✨ Ready to process requests!\n');
});
