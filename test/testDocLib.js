// Test Script - DocLib Data Retrieval
const docLibService = require('../src/services/docLibService');

async function testDocLibRetrieval() {
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║   DocLib Data Retrieval Test                  ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    try {
        // Test DocLibId
        const docLibId = "16";
        
        console.log(`Testing with DocLibId: ${docLibId}\n`);
        
        // Get DocLib data
        const result = await docLibService.getDocLibData(docLibId);
        
        console.log('\n╔════════════════════════════════════════════════╗');
        console.log('║   RESULT                                      ║');
        console.log('╚════════════════════════════════════════════════╝\n');
        
        if (result.success) {
            console.log('✅ SUCCESS!\n');
            console.log('📋 Response Data:');
            console.log(JSON.stringify(result.data, null, 2));
            
            // Extract useful information
            if (result.data && result.data.entities) {
                console.log('\n📊 Summary:');
                console.log('Entities found:', result.data.entities.length);
                
                if (result.data.entities[0] && result.data.entities[0].data) {
                    const docLibData = result.data.entities[0].data;
                    console.log('Documents in DocLib:', docLibData.length);
                    
                    if (docLibData.length > 0) {
                        console.log('\n📄 First Document:');
                        console.log(JSON.stringify(docLibData[0], null, 2));
                    }
                }
            }
        } else {
            console.log('❌ FAILED!\n');
            console.log('Error:', result.error);
            if (result.details) {
                console.log('Details:', JSON.stringify(result.details, null, 2));
            }
        }
        
    } catch (error) {
        console.error('\n❌ Test failed with exception:');
        console.error(error);
    }
}

// Run test
testDocLibRetrieval();
