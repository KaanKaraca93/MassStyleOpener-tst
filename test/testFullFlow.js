// Test Script - Full Flow Test (DocLib → Hierarchy → Style Creation)
const docLibService = require('../src/services/docLibService');
const hierarchyService = require('../src/services/hierarchyService');
const styleService = require('../src/services/styleService');

async function testFullFlow() {
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║   FULL FLOW TEST                              ║');
    console.log('║   DocLib → Hierarchy → Style Creation         ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    const totalStartTime = Date.now();
    let docLibData = null;
    let hierarchyData = null;
    let styleData = null;

    try {
        // ====================================
        // STEP 1: Get DocLib Data
        // ====================================
        console.log('📚 STEP 1: Fetching DocLib Data');
        console.log('═'.repeat(50));
        
        const docLibId = "16";
        const step1Start = Date.now();
        const docLibResult = await docLibService.getDocLibData(docLibId);
        const step1Elapsed = Date.now() - step1Start;
        
        if (!docLibResult.success) {
            console.log(`❌ FAILED - ${docLibResult.error}`);
            return;
        }
        
        console.log(`✅ SUCCESS (${step1Elapsed}ms)`);
        
        // Extract data
        const docLibEntity = docLibResult.data.entities[0];
        docLibData = {
            brandId: docLibEntity.column.BrandId,
            brandName: docLibEntity.column.BrandId_Lookup?.Name,
            subSubCategoryId: docLibEntity.column.SubSubCategoryId,
            subSubCategoryName: docLibEntity.column.SubSubCategoryId_Lookup?.Name,
            seasonId: docLibEntity.column.SeasonId,
            seasonName: docLibEntity.column.SeasonId_Lookup?.Name,
            filename: docLibEntity.column.Filename,
            imageUrl: docLibEntity.column.Image
        };
        
        console.log('\n📊 Extracted Data:');
        console.log(`   Brand: ${docLibData.brandName} (ID: ${docLibData.brandId})`);
        console.log(`   SubSubCategory: ${docLibData.subSubCategoryName} (ID: ${docLibData.subSubCategoryId})`);
        console.log(`   Season: ${docLibData.seasonName} (ID: ${docLibData.seasonId})`);

        // ====================================
        // STEP 2: Get Hierarchy Info
        // ====================================
        console.log('\n\n🏗️  STEP 2: Fetching Hierarchy Info');
        console.log('═'.repeat(50));
        
        const step2Start = Date.now();
        const hierarchyResult = await hierarchyService.getHierarchyInfo(
            docLibData.brandId,
            docLibData.subSubCategoryId
        );
        const step2Elapsed = Date.now() - step2Start;
        
        if (!hierarchyResult.success) {
            console.log(`❌ FAILED - ${hierarchyResult.error}`);
            return;
        }
        
        console.log(`✅ SUCCESS (${step2Elapsed}ms)`);
        console.log(`📦 Cached: ${hierarchyResult.fromCache ? 'YES' : 'NO'}`);
        
        hierarchyData = hierarchyResult;
        
        console.log('\n📊 Hierarchy Mapping:');
        console.log(`   Brand ID: ${hierarchyData.brandId}`);
        console.log(`   Division ID: ${hierarchyData.divisionId}`);
        console.log(`   Category ID: ${hierarchyData.categoryId}`);
        console.log(`   SubCategory ID: ${hierarchyData.subCategoryId}`);
        console.log(`   SubSubCategory ID: ${hierarchyData.subSubCategoryId}`);
        console.log(`   UserDefinedField2 ID: ${hierarchyData.userDefinedField2Id}`);
        console.log(`\n   Path: ${hierarchyData.path}`);

        // ====================================
        // STEP 3: Create Style
        // ====================================
        console.log('\n\n🎨 STEP 3: Creating Style');
        console.log('═'.repeat(50));
        
        const step3Start = Date.now();
        const styleResult = await styleService.createStyle({
            brandId: hierarchyData.brandId,
            divisionId: hierarchyData.divisionId,
            categoryId: hierarchyData.categoryId,
            subCategoryId: hierarchyData.subCategoryId,
            subSubCategoryId: hierarchyData.subSubCategoryId,
            userDefinedField2Id: hierarchyData.userDefinedField2Id,
            seasonId: docLibData.seasonId,
            name: `Auto-${docLibData.subSubCategoryName}`,
            description: `Auto-created from ${docLibData.filename}`
        });
        const step3Elapsed = Date.now() - step3Start;
        
        if (!styleResult.success) {
            console.log(`❌ FAILED - ${styleResult.error}`);
            if (styleResult.details) {
                console.log('Details:', JSON.stringify(styleResult.details, null, 2));
            }
            return;
        }
        
        console.log(`✅ SUCCESS (${step3Elapsed}ms)`);
        
        styleData = styleResult;
        
        console.log('\n📊 Created Style:');
        console.log(`   Style Key: ${styleData.styleKey}`);
        console.log(`   Style Code: ${styleData.styleCode}`);

        // ====================================
        // SUMMARY
        // ====================================
        const totalElapsed = Date.now() - totalStartTime;
        
        console.log('\n\n╔════════════════════════════════════════════════╗');
        console.log('║   FULL FLOW SUMMARY                           ║');
        console.log('╚════════════════════════════════════════════════╝\n');
        
        console.log('⏱️  Performance Metrics:');
        console.log(`   Step 1 (DocLib):     ${step1Elapsed}ms`);
        console.log(`   Step 2 (Hierarchy):  ${step2Elapsed}ms ${hierarchyResult.fromCache ? '(cached)' : '(fresh)'}`);
        console.log(`   Step 3 (Style):      ${step3Elapsed}ms`);
        console.log(`   ─────────────────────────────────`);
        console.log(`   TOTAL:               ${totalElapsed}ms (${(totalElapsed/1000).toFixed(2)}s)`);
        
        console.log('\n📋 Results:');
        console.log(`   ✅ DocLib Data Retrieved`);
        console.log(`   ✅ Hierarchy Mapped`);
        console.log(`   ✅ Style Created`);
        
        console.log(`\n🎉 SUCCESS! Style ${styleData.styleCode} created from DocLib ${docLibId}`);
        
        console.log('\n💡 Performance Analysis:');
        if (totalElapsed < 5000) {
            console.log('   ✅ EXCELLENT - Full flow under 5 seconds');
        } else if (totalElapsed < 8000) {
            console.log('   ✅ GOOD - Full flow under 8 seconds');
        } else {
            console.log('   ⚠️  ACCEPTABLE - Full flow over 8 seconds');
        }
        
        if (hierarchyResult.fromCache) {
            console.log('   ✅ Cache is working! Significant speed boost.');
        }
        
        // Test cache by running again
        console.log('\n\n🔄 Testing cache effect with second request...');
        const secondStart = Date.now();
        const hierarchyResult2 = await hierarchyService.getHierarchyInfo(
            docLibData.brandId,
            docLibData.subSubCategoryId
        );
        const secondElapsed = Date.now() - secondStart;
        
        console.log(`\n📊 Second hierarchy lookup: ${secondElapsed}ms (${hierarchyResult2.fromCache ? 'CACHED' : 'FRESH'})`);
        console.log(`⚡ Speed improvement: ${step2Elapsed}ms → ${secondElapsed}ms (${Math.round((1 - secondElapsed/step2Elapsed) * 100)}% faster)`);
        
    } catch (error) {
        console.error('\n❌ Test failed with exception:');
        console.error(error);
    }
}

// Run test
testFullFlow();
