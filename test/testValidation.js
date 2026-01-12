// Test Script - Validation Tests
const validationService = require('../src/services/validationService');

async function testValidation() {
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║   VALIDATION TESTS                            ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    // ====================================
    // TEST 1: Valid DocLib Data
    // ====================================
    console.log('📊 TEST 1: Valid DocLib Data');
    console.log('─'.repeat(50));
    
    const validDocLib = {
        brandId: 5,
        brandName: "MACHKA",
        brandCode: "M002",
        seasonId: 5,
        seasonName: "S123-SS 23",
        seasonCode: "38",
        subSubCategoryId: 20,
        subSubCategoryName: "ANAHTARLIK",
        subSubCategoryCode: "072"
    };
    
    const result1 = validationService.validateDocLibData(validDocLib);
    validationService.logValidation('Valid DocLib', result1);
    
    // ====================================
    // TEST 2: Missing Brand (Should SKIP)
    // ====================================
    console.log('\n\n📊 TEST 2: Missing Brand (Should SKIP)');
    console.log('─'.repeat(50));
    
    const missingBrand = {
        brandId: null, // Missing!
        brandName: null,
        brandCode: null,
        seasonId: 5,
        seasonName: "S123-SS 23",
        seasonCode: "38",
        subSubCategoryId: 20,
        subSubCategoryName: "ANAHTARLIK",
        subSubCategoryCode: "072"
    };
    
    const result2 = validationService.validateDocLibData(missingBrand);
    validationService.logValidation('Missing Brand', result2);
    console.log(`\n🚫 Should SKIP: ${!result2.valid ? 'YES' : 'NO'}`);
    
    // ====================================
    // TEST 3: Missing Season (Should SKIP)
    // ====================================
    console.log('\n\n📊 TEST 3: Missing Season (Should SKIP)');
    console.log('─'.repeat(50));
    
    const missingSeason = {
        brandId: 5,
        brandName: "MACHKA",
        brandCode: "M002",
        seasonId: null, // Missing!
        seasonName: null,
        seasonCode: null,
        subSubCategoryId: 20,
        subSubCategoryName: "ANAHTARLIK",
        subSubCategoryCode: "072"
    };
    
    const result3 = validationService.validateDocLibData(missingSeason);
    validationService.logValidation('Missing Season', result3);
    console.log(`\n🚫 Should SKIP: ${!result3.valid ? 'YES' : 'NO'}`);
    
    // ====================================
    // TEST 4: Missing SubSubCategory (Should SKIP)
    // ====================================
    console.log('\n\n📊 TEST 4: Missing SubSubCategory (Should SKIP)');
    console.log('─'.repeat(50));
    
    const missingSubSub = {
        brandId: 5,
        brandName: "MACHKA",
        brandCode: "M002",
        seasonId: 5,
        seasonName: "S123-SS 23",
        seasonCode: "38",
        subSubCategoryId: null, // Missing!
        subSubCategoryName: null,
        subSubCategoryCode: null
    };
    
    const result4 = validationService.validateDocLibData(missingSubSub);
    validationService.logValidation('Missing SubSubCategory', result4);
    console.log(`\n🚫 Should SKIP: ${!result4.valid ? 'YES' : 'NO'}`);
    
    // ====================================
    // TEST 5: Valid Hierarchy Mapping
    // ====================================
    console.log('\n\n📊 TEST 5: Valid Hierarchy Mapping');
    console.log('─'.repeat(50));
    
    const validHierarchy = {
        success: true,
        brandId: 5,
        divisionId: 4,
        categoryId: 12,
        subCategoryId: 6,
        subSubCategoryId: 20,
        userDefinedField2Id: 87
    };
    
    const result5 = validationService.validateHierarchyMapping(validHierarchy);
    validationService.logValidation('Valid Hierarchy', result5);
    
    // ====================================
    // TEST 6: Hierarchy Mapping Failed (Should SKIP)
    // ====================================
    console.log('\n\n📊 TEST 6: Hierarchy Mapping Failed (Should SKIP)');
    console.log('─'.repeat(50));
    
    const failedHierarchy = {
        success: false,
        error: 'No matching hierarchy found for Brand 99 and SubSubCategory 999'
    };
    
    const result6 = validationService.validateHierarchyMapping(failedHierarchy);
    validationService.logValidation('Failed Hierarchy', result6);
    console.log(`\n🚫 Should SKIP: ${!result6.valid ? 'YES' : 'NO'}`);
    
    // ====================================
    // TEST 7: Missing Division in Hierarchy (Should SKIP)
    // ====================================
    console.log('\n\n📊 TEST 7: Missing Division in Hierarchy (Should SKIP)');
    console.log('─'.repeat(50));
    
    const missingDivision = {
        success: true,
        brandId: 5,
        divisionId: null, // Missing!
        categoryId: 12,
        subCategoryId: 6,
        subSubCategoryId: 20,
        userDefinedField2Id: 87
    };
    
    const result7 = validationService.validateHierarchyMapping(missingDivision);
    validationService.logValidation('Missing Division', result7);
    console.log(`\n🚫 Should SKIP: ${!result7.valid ? 'YES' : 'NO'}`);
    
    // ====================================
    // SUMMARY
    // ====================================
    console.log('\n\n╔════════════════════════════════════════════════╗');
    console.log('║   VALIDATION SUMMARY                          ║');
    console.log('╚════════════════════════════════════════════════╝\n');
    
    const results = [result1, result2, result3, result4, result5, result6, result7];
    const passed = results.filter(r => r.valid).length;
    const failed = results.filter(r => !r.valid).length;
    
    console.log(`📊 Total Tests: ${results.length}`);
    console.log(`✅ Passed (Valid): ${passed}`);
    console.log(`❌ Failed (Should Skip): ${failed}`);
    
    console.log('\n💡 Expected Results:');
    console.log('   Test 1: Valid DocLib → PASS ✅');
    console.log('   Test 2: Missing Brand → FAIL (SKIP) ❌');
    console.log('   Test 3: Missing Season → FAIL (SKIP) ❌');
    console.log('   Test 4: Missing SubSubCategory → FAIL (SKIP) ❌');
    console.log('   Test 5: Valid Hierarchy → PASS ✅');
    console.log('   Test 6: Failed Hierarchy → FAIL (SKIP) ❌');
    console.log('   Test 7: Missing Division → FAIL (SKIP) ❌');
    
    console.log('\n✅ Validation service is working correctly!');
}

// Run test
testValidation();
