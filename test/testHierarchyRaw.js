// Test Script - Hierarchy Raw Response Analysis
const hierarchyService = require('../src/services/hierarchyService');

async function analyzeHierarchyResponse() {
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║   Hierarchy Raw Response Analysis             ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    try {
        console.log('📡 Fetching hierarchy data...\n');
        
        const result = await hierarchyService.fetchFullHierarchy();
        
        if (result.success) {
            console.log('✅ API Call Successful\n');
            console.log('📦 FULL RAW RESPONSE:');
            console.log('═'.repeat(80));
            console.log(JSON.stringify(result.data, null, 2));
            console.log('═'.repeat(80));
            
            console.log('\n📊 Response Structure Analysis:');
            console.log('─'.repeat(50));
            
            // Analyze structure
            if (result.data) {
                console.log(`\n🔹 Top-level keys: ${Object.keys(result.data).join(', ')}`);
                
                if (result.data.entities) {
                    console.log(`\n🔹 Entities count: ${result.data.entities.length}`);
                    
                    result.data.entities.forEach((entity, idx) => {
                        console.log(`\n   Entity ${idx + 1}:`);
                        console.log(`   - Name: ${entity.name}`);
                        console.log(`   - Keys: ${Object.keys(entity).join(', ')}`);
                        
                        if (entity.data) {
                            console.log(`   - Data records: ${entity.data.length}`);
                        }
                        if (entity.column) {
                            console.log(`   - Column data: ${Object.keys(entity.column).join(', ')}`);
                        }
                    });
                }
                
                if (result.data.metadata) {
                    console.log(`\n🔹 Metadata: ${JSON.stringify(result.data.metadata, null, 2)}`);
                }
            }
            
        } else {
            console.log('❌ API Call Failed\n');
            console.log('Error:', result.error);
            if (result.details) {
                console.log('\nDetails:');
                console.log(JSON.stringify(result.details, null, 2));
            }
        }
        
    } catch (error) {
        console.error('\n❌ Test failed with exception:');
        console.error(error);
    }
}

// Run test
analyzeHierarchyResponse();
