// Main Application Entry Point
const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const docLibService = require('./services/docLibService');
const hierarchyService = require('./services/hierarchyService');
const styleService = require('./services/styleService');
const imageService = require('./services/imageService');
const validationService = require('./services/validationService');
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

// Full Flow: Create Style with Image
app.post('/api/style/create', async (req, res) => {
    const startTime = Date.now();
    
    try {
        const { DocLibId } = req.body;
        
        if (!DocLibId) {
            return res.status(400).json({
                success: false,
                error: 'DocLibId is required'
            });
        }
        
        console.log(`\n╔════════════════════════════════════════════════╗`);
        console.log(`║   STYLE CREATION REQUEST                      ║`);
        console.log(`╚════════════════════════════════════════════════╝`);
        console.log(`📥 DocLibId: ${DocLibId}`);
        console.log(`⏰ Start Time: ${new Date().toISOString()}\n`);
        
        // Step 1: Get DocLib Data
        console.log('📦 Step 1: Fetching DocLib data...');
        const docLibData = await docLibService.getDocLibData(DocLibId);
        
        if (!docLibData.success) {
            return res.status(400).json({
                success: false,
                error: 'Failed to fetch DocLib data',
                details: docLibData.error
            });
        }
        
        // Step 2: Validate DocLib Data
        console.log('✓ Step 2: Validating DocLib data...');
        const docLibValidation = validationService.validateDocLibData(docLibData.data);
        
        if (!docLibValidation.isValid) {
            console.log('❌ DocLib validation failed');
            return res.status(400).json({
                success: false,
                error: 'DocLib validation failed',
                errors: docLibValidation.errors,
                warnings: docLibValidation.warnings
            });
        }
        
        if (docLibValidation.warnings.length > 0) {
            console.log('⚠️  Warnings:', docLibValidation.warnings);
        }
        
        // Step 3: Get Hierarchy Info
        console.log('🌳 Step 3: Fetching hierarchy info...');
        const hierarchyData = await hierarchyService.getHierarchyInfo(
            docLibData.data.brandId,
            docLibData.data.subSubCategoryId
        );
        
        if (!hierarchyData.success) {
            return res.status(400).json({
                success: false,
                error: 'Failed to fetch hierarchy data',
                details: hierarchyData.error
            });
        }
        
        // Step 4: Validate Hierarchy Mapping
        console.log('✓ Step 4: Validating hierarchy mapping...');
        const hierarchyValidation = validationService.validateHierarchyMapping(hierarchyData);
        
        if (!hierarchyValidation.isValid) {
            console.log('❌ Hierarchy validation failed');
            return res.status(400).json({
                success: false,
                error: 'Hierarchy mapping validation failed',
                errors: hierarchyValidation.errors
            });
        }
        
        // Step 5: Create Style
        console.log('🎨 Step 5: Creating style...');
        const styleResult = await styleService.createStyle(docLibData.data, hierarchyData.data);
        
        if (!styleResult.success) {
            return res.status(500).json({
                success: false,
                error: 'Failed to create style',
                details: styleResult.error
            });
        }
        
        // Step 6: Upload Image
        console.log('📸 Step 6: Uploading image...');
        const imageResult = await imageService.uploadImageToStyle(
            docLibData.data.imageUrl,
            styleResult.data.styleKey,
            docLibData.data.filename
        );
        
        if (!imageResult.success) {
            console.log('⚠️  Style created but image upload failed');
            return res.status(207).json({
                success: true,
                partial: true,
                message: 'Style created successfully, but image upload failed',
                data: {
                    style: styleResult.data,
                    imageError: imageResult.error
                },
                timing: {
                    total_ms: Date.now() - startTime
                }
            });
        }
        
        // Success!
        const totalTime = Date.now() - startTime;
        console.log(`\n✅ SUCCESS! Style created in ${totalTime}ms`);
        console.log(`   Style Key: ${styleResult.data.styleKey}`);
        console.log(`   Style Code: ${styleResult.data.styleCode}`);
        console.log(`   Image: ${imageResult.data.objectKey}\n`);
        
        res.json({
            success: true,
            message: 'Style created successfully with image',
            data: {
                style: styleResult.data,
                image: imageResult.data
            },
            timing: {
                total_ms: totalTime
            }
        });
        
    } catch (error) {
        console.error('❌ Error in /api/style/create:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timing: {
                total_ms: Date.now() - startTime
            }
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
    console.log(`   POST http://localhost:${PORT}/api/style/create`);
    console.log('\n✨ Ready to process requests!\n');
});
