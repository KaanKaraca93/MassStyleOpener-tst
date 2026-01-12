// DocLib Service - Fetch document library data
const axios = require('axios');
const config = require('../config/config');
const tokenService = require('./tokenService');

class DocLibService {
    constructor() {
        this.baseUrl = config.plm.baseUrl;
    }

    /**
     * Get DocLib entity data
     * @param {string} docLibId - Document Library ID
     * @returns {Promise<Object>} DocLib data
     */
    async getDocLibData(docLibId) {
        try {
            console.log(`\n📚 Fetching DocLib data for ID: ${docLibId}`);
            
            // Get access token
            const token = await tokenService.getToken();
            
            // Build endpoint URL
            const endpoint = `${this.baseUrl}/view/api/view/entity/data/get`;
            console.log(`📡 Endpoint: ${endpoint}`);
            
            // Build payload
            const payload = {
                roleId: 1009,
                userId: config.plm.userId,
                mainEntity: "DocLib",
                entities: [
                    {
                        ignoreMetadata: false,
                        searchable: [
                            null,
                            "Name",
                            "Description",
                            null,
                            null,
                            null,
                            "Filename",
                            "MIMEType",
                            "FileSize",
                            "CreateDate",
                            "ModifyDate",
                            "CreateId",
                            "ModifyId",
                            "InternalID",
                            "IsAnnotated",
                            "IdmDocType",
                            "4091b609-3361-41fd-9651-ba3b410d3af2",
                            "BrandId",
                            "SubSubCategoryId",
                            "SeasonId"
                        ],
                        dataFilter: {
                            Conditions: [
                                {
                                    fieldName: "DocLibId",
                                    operator: "=",
                                    value: docLibId
                                },
                                {
                                    fieldName: "IDMDocumentType",
                                    operator: "=",
                                    value: "TopluAksesuarAcma"
                                }
                            ]
                        },
                        parent: null,
                        name: "DocLib",
                        sortInfo: null,
                        lookupRef: [
                            "CreateId",
                            "ModifyId",
                            "BrandId",
                            "SubSubCategoryId",
                            "SeasonId"
                        ],
                        columns: [
                            "Name",
                            "Description",
                            "Filename",
                            "MIMEType",
                            "FileSize",
                            "CreateDate",
                            "ModifyDate",
                            "CreateId",
                            "ModifyId",
                            "InternalID",
                            "IsAnnotated",
                            "IdmDocType",
                            "BrandId",
                            "SubSubCategoryId",
                            "SeasonId",
                            "DocLibId"
                        ]
                    }
                ],
                lookups: [
                    "User",
                    "Brand",
                    "SubSubCategory",
                    "Season"
                ],
                includeLookups: true,
                pageType: "details",
                Schema: config.plm.schema
            };

            console.log('📦 Payload:', JSON.stringify(payload, null, 2));
            
            // Make API request
            const response = await axios.post(endpoint, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    ...config.headers
                }
            });

            console.log('✅ DocLib data retrieved successfully');
            
            // Extract and parse response data
            const extractedData = this.extractDocLibData(response.data);
            console.log('📋 Extracted Data Keys:', Object.keys(extractedData));
            
            return {
                success: true,
                data: extractedData
            };
            
        } catch (error) {
            console.error('❌ Error fetching DocLib data:');
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Status Text:', error.response.statusText);
                console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
            } else {
                console.error('Message:', error.message);
            }
            
            return {
                success: false,
                error: error.message,
                details: error.response?.data
            };
        }
    }

    /**
     * Extract and parse DocLib response data
     * @param {Object} responseData - Raw API response
     * @returns {Object} Parsed DocLib data
     */
    extractDocLibData(responseData) {
        try {
            console.log('🔍 FULL RESPONSE:', JSON.stringify(responseData, null, 2));
            
            // Navigate to actual data: entities[0].column (NOT data!)
            const docLibRecord = responseData?.entities?.[0]?.column;
            
            console.log('🔍 docLibRecord:', JSON.stringify(docLibRecord, null, 2));
            
            if (!docLibRecord) {
                console.error('❌ No DocLib record found in entities[0].column');
                console.error('❌ responseData.entities:', responseData?.entities);
                throw new Error('No DocLib record found in response');
            }

            console.log('✅ DocLib record found!');
            console.log('📋 BrandId:', docLibRecord.BrandId);
            console.log('📋 SeasonId:', docLibRecord.SeasonId);
            console.log('📋 SubSubCategoryId:', docLibRecord.SubSubCategoryId);

            // Image URL is already complete (not a relative path)
            const imageUrl = docLibRecord.Image;
            
            return {
                docLibId: docLibRecord.DocLibId,
                imageUrl: imageUrl,
                filename: docLibRecord.Filename || 'unknown.png',
                brandId: docLibRecord.BrandId,
                seasonId: docLibRecord.SeasonId,
                subSubCategoryId: docLibRecord.SubSubCategoryId,
                // Flat lookup data for validation
                brandCode: docLibRecord.BrandId_Lookup?.Code || null,
                brandName: docLibRecord.BrandId_Lookup?.Name || null,
                seasonCode: docLibRecord.SeasonId_Lookup?.Code || null,
                seasonName: docLibRecord.SeasonId_Lookup?.Name || null,
                subSubCategoryCode: docLibRecord.SubSubCategoryId_Lookup?.Code || null,
                subSubCategoryName: docLibRecord.SubSubCategoryId_Lookup?.Name || null,
                // Original lookup objects
                BrandId_Lookup: docLibRecord.BrandId_Lookup || null,
                SeasonId_Lookup: docLibRecord.SeasonId_Lookup || null,
                SubSubCategoryId_Lookup: docLibRecord.SubSubCategoryId_Lookup || null
            };
            
        } catch (error) {
            console.error('❌ Error extracting DocLib data:', error.message);
            throw error;
        }
    }
}

// Export singleton instance
module.exports = new DocLibService();
