// Test Script - Hierarchy Performance Test
const hierarchyService = require('../src/services/hierarchyService');

async function testHierarchyPerformance() {
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║   Hierarchy API Performance Test              ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    try {
        // Test 1: First fetch (cold start)
        console.log('📊 TEST 1: First Fetch (Cold Start)');
        console.log('─'.repeat(50));
        const startTime1 = Date.now();
        const result1 = await hierarchyService.fetchFullHierarchy();
        const elapsed1 = Date.now() - startTime1;
        
        if (result1.success) {
            console.log(`\n✅ SUCCESS - Elapsed: ${elapsed1}ms`);
            console.log(`📦 Response size: ${JSON.stringify(result1.data).length} bytes`);
            
            // Analyze data structure
            if (result1.data && result1.data.entities && result1.data.entities.length > 0) {
                const orgLevels = result1.data.entities[0].data || [];
                console.log(`📊 Total OrgLevel records: ${orgLevels.length}`);
                
                // Show first few records
                console.log('\n📋 First 3 records:');
                orgLevels.slice(0, 3).forEach((org, idx) => {
                    console.log(`\n${idx + 1}. ${org.Name} (Level: ${org.Level})`);
                    console.log(`   OrgLevelId: ${org.OrgLevelId}`);
                    console.log(`   ParentId: ${org.ParentId}`);
                    console.log(`   Code: ${org.Code}`);
                    console.log(`   Path: ${org.Path}`);
                });
                
                // Group by level
                const levelMap = {};
                orgLevels.forEach(org => {
                    const level = org.Level;
                    if (!levelMap[level]) {
                        levelMap[level] = [];
                    }
                    levelMap[level].push(org);
                });
                
                console.log('\n📊 Records by Level:');
                Object.keys(levelMap).sort().forEach(level => {
                    console.log(`   Level ${level}: ${levelMap[level].length} records`);
                    // Show examples
                    if (levelMap[level].length > 0) {
                        const examples = levelMap[level].slice(0, 3).map(o => o.Name).join(', ');
                        console.log(`      Examples: ${examples}${levelMap[level].length > 3 ? '...' : ''}`);
                    }
                });
            }
        } else {
            console.log(`\n❌ FAILED - ${result1.error}`);
            if (result1.details) {
                console.log('Details:', JSON.stringify(result1.details, null, 2));
            }
        }

        // Test 2: Second fetch (should use cache)
        console.log('\n\n📊 TEST 2: Second Fetch (Cache Test)');
        console.log('─'.repeat(50));
        const startTime2 = Date.now();
        const result2 = await hierarchyService.getFullHierarchy();
        const elapsed2 = Date.now() - startTime2;
        
        console.log(`\n✅ Elapsed: ${elapsed2}ms`);
        console.log(`📦 Cached: ${result2.cached ? 'YES' : 'NO'}`);
        console.log(`⚡ Speed improvement: ${elapsed1}ms → ${elapsed2}ms (${Math.round((1 - elapsed2/elapsed1) * 100)}% faster)`);

        // Test 3: Cache statistics
        console.log('\n\n📊 TEST 3: Cache Statistics');
        console.log('─'.repeat(50));
        const stats = hierarchyService.getCacheStats();
        console.log(JSON.stringify(stats, null, 2));

        // Test 4: Test getHierarchyInfo (with sample data)
        console.log('\n\n📊 TEST 4: Get Hierarchy Info for Brand+SubSubCategory');
        console.log('─'.repeat(50));
        const startTime4 = Date.now();
        const result4 = await hierarchyService.getHierarchyInfo(5, 20);
        const elapsed4 = Date.now() - startTime4;
        
        console.log(`\n✅ Elapsed: ${elapsed4}ms`);
        console.log('Result:', JSON.stringify(result4, null, 2));

        // Summary
        console.log('\n\n╔════════════════════════════════════════════════╗');
        console.log('║   PERFORMANCE SUMMARY                         ║');
        console.log('╚════════════════════════════════════════════════╝\n');
        
        console.log(`📊 First Fetch (Cold):     ${elapsed1}ms`);
        console.log(`📊 Second Fetch (Cached):  ${elapsed2}ms`);
        console.log(`📊 Hierarchy Lookup:       ${elapsed4}ms`);
        console.log(`⚡ Cache Speed Gain:       ${Math.round((1 - elapsed2/elapsed1) * 100)}%`);
        
        console.log('\n📈 Performance Analysis:');
        if (elapsed1 < 1000) {
            console.log('   ✅ EXCELLENT - API response under 1 second');
        } else if (elapsed1 < 2000) {
            console.log('   ✅ GOOD - API response under 2 seconds');
        } else if (elapsed1 < 3000) {
            console.log('   ⚠️  ACCEPTABLE - API response under 3 seconds');
        } else {
            console.log('   ❌ SLOW - API response over 3 seconds');
        }
        
        console.log('\n💡 Recommendation:');
        if (elapsed1 < 2000) {
            console.log('   ✅ Real-time fetching is VIABLE');
            console.log('   ✅ Hybrid cache approach will work GREAT');
            console.log(`   📊 Expected response time with cache: ~${elapsed2}ms`);
        } else {
            console.log('   ⚠️  Consider scheduled cache approach');
            console.log('   ⚠️  Real-time fetching might be too slow');
        }
        
    } catch (error) {
        console.error('\n❌ Test failed with exception:');
        console.error(error);
    }
}

// Run test
testHierarchyPerformance();
