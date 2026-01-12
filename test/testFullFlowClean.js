// Test Script - Full Flow Test with Cache Clear
const docLibService = require('../src/services/docLibService');
const hierarchyService = require('../src/services/hierarchyService');
const styleService = require('../src/services/styleService');
const validationService = require('../src/services/validationService');
const imageService = require('../src/services/imageService');

async function testFullFlow() {
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║   FULL FLOW TEST (Fresh - Cache Cleared)     ║');
    console.log('║   DocLib → Hierarchy → Style Creation         ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    // Clear cache to test fresh
    hierarchyService.clearCache();

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
            brandCode: docLibEntity.column.BrandId_Lookup?.Code,
            subSubCategoryId: docLibEntity.column.SubSubCategoryId,
            subSubCategoryName: docLibEntity.column.SubSubCategoryId_Lookup?.Name,
            subSubCategoryCode: docLibEntity.column.SubSubCategoryId_Lookup?.Code,
            seasonId: docLibEntity.column.SeasonId,
            seasonName: docLibEntity.column.SeasonId_Lookup?.Name,
            seasonCode: docLibEntity.column.SeasonId_Lookup?.Code,
            filename: docLibEntity.column.Filename,
            imageUrl: docLibEntity.column.Image
        };
        
        console.log('\n📊 Extracted Data:');
        console.log(`   Brand: ${docLibData.brandName} (ID: ${docLibData.brandId}, Code: ${docLibData.brandCode})`);
        console.log(`   SubSubCategory: ${docLibData.subSubCategoryName} (ID: ${docLibData.subSubCategoryId}, Code: ${docLibData.subSubCategoryCode})`);
        console.log(`   Season: ${docLibData.seasonName} (ID: ${docLibData.seasonId}, Code: ${docLibData.seasonCode})`);
        
        // ====================================
        // VALIDATION 1: Required Fields Check
        // ====================================
        console.log('\n\n🔍 VALIDATION 1: Required Fields Check');
        console.log('═'.repeat(50));
        
        const docLibValidation = validationService.validateDocLibData(docLibData);
        validationService.logValidation('DocLib Data', docLibValidation);
        
        if (!docLibValidation.valid) {
            console.log('\n❌ SKIPPING - Required fields missing');
            console.log(`Reason: ${docLibValidation.reason}`);
            return;
        }

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
        console.log(`   UserDefinedField2 ID: ${hierarchyData.userDefinedField2Id} ${hierarchyData.userDefinedField2Id ? '✅' : '❌'}`);
        console.log(`\n   Path: ${hierarchyData.path}`);
        
        // ====================================
        // VALIDATION 2: Hierarchy Mapping Check
        // ====================================
        console.log('\n\n🔍 VALIDATION 2: Hierarchy Mapping Check');
        console.log('═'.repeat(50));
        
        const hierarchyValidation = validationService.validateHierarchyMapping(hierarchyData);
        validationService.logValidation('Hierarchy Mapping', hierarchyValidation);
        
        if (!hierarchyValidation.valid) {
            console.log('\n❌ SKIPPING - Hierarchy mapping incomplete');
            console.log(`Reason: ${hierarchyValidation.reason}`);
            return;
        }

        // Check if UserDefinedField2Id is populated
        if (!hierarchyData.userDefinedField2Id) {
            console.log('\n⚠️  WARNING: UserDefinedField2Id is null!');
        }

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
            description: `Auto-created from ${docLibData.filename}`,
            // ID Generation fields
            brandName: docLibData.brandName,
            brandCode: docLibData.brandCode,
            seasonName: docLibData.seasonName,
            seasonCode: docLibData.seasonCode,
            subSubCategoryCode: docLibData.subSubCategoryCode
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
        // STEP 4: Upload Image to Style
        // ====================================
        console.log('\n\n📸 STEP 4: Uploading Image to Style');
        console.log('═'.repeat(50));
        
        const step4Start = Date.now();
        const imageResult = await imageService.uploadImageToStyle(
            docLibData.imageUrl,
            styleData.styleKey
        );
        const step4Elapsed = Date.now() - step4Start;
        
        if (!imageResult.success) {
            console.log(`❌ FAILED - ${imageResult.error}`);
            if (imageResult.details) {
                console.log('Details:', JSON.stringify(imageResult.details, null, 2));
            }
            // Continue anyway - image upload is not critical
        } else {
            console.log(`✅ SUCCESS (${step4Elapsed}ms)`);
            console.log(`📋 Image attached as main visual`);
        }

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
        console.log(`   Step 4 (Image):      ${step4Elapsed}ms ${imageResult.success ? '✅' : '❌'}`);
        console.log(`   ─────────────────────────────────`);
        console.log(`   TOTAL:               ${totalElapsed}ms (${(totalElapsed/1000).toFixed(2)}s)`);
        
        console.log('\n📋 Results:');
        console.log(`   ✅ DocLib Data Retrieved & Validated`);
        console.log(`   ✅ Hierarchy Mapped & Validated`);
        console.log(`   ✅ Style Created`);
        console.log(`   ${imageResult.success ? '✅' : '❌'} Image ${imageResult.success ? 'Uploaded' : 'Upload Failed'}`);
        
        console.log(`\n🎉 SUCCESS! Style ${styleData.styleCode} created from DocLib ${docLibId}`);
        
        console.log('\n💡 Performance Analysis:');
        if (totalElapsed < 5000) {
            console.log('   ✅ EXCELLENT - Full flow under 5 seconds');
        } else if (totalElapsed < 8000) {
            console.log('   ✅ GOOD - Full flow under 8 seconds');
        } else {
            console.log('   ⚠️  ACCEPTABLE - Full flow over 8 seconds');
        }
        
    } catch (error) {
        console.error('\n❌ Test failed with exception:');
        console.error(error);
    }
}

// Run test
testFullFlow();
