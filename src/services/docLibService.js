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
            
            return {
                success: true,
                data: response.data
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
}

// Export singleton instance
module.exports = new DocLibService();
