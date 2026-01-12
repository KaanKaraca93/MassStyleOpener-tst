// Style Service - Product/Style Creation
const axios = require('axios');
const config = require('../config/config');
const tokenService = require('./tokenService');

class StyleService {
    constructor() {
        this.baseUrl = config.plm.baseUrl;
    }

    /**
     * Create a new style in PLM
     * @param {Object} styleData - Style creation data
     * @returns {Promise<Object>} Creation result
     */
    async createStyle(styleData) {
        try {
            console.log('\n🎨 Creating style in PLM...');
            const startTime = Date.now();
            
            // Get access token
            const token = await tokenService.getToken();
            
            // Build endpoint URL
            const endpoint = `${this.baseUrl}/pdm/api/pdm/style/v2/save`;
            console.log(`📡 Endpoint: ${endpoint}`);
            
            // Build payload
            const payload = this.buildStylePayload(styleData);
            
            console.log('📦 Style Payload:');
            console.log(JSON.stringify(payload, null, 2));
            
            // Make API request
            const response = await axios.post(endpoint, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    ...config.headers
                }
            });

            const elapsed = Date.now() - startTime;
            console.log(`✅ Style created successfully in ${elapsed}ms`);
            console.log('📋 PLM Response:', JSON.stringify(response.data, null, 2));
            
            return {
                success: true,
                data: response.data,
                elapsed: elapsed,
                styleKey: response.data.key,
                styleCode: response.data.addedCode
            };
            
        } catch (error) {
            console.error('❌ Error creating style:');
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
     * Build style creation payload
     * @param {Object} data - Input data
     * @returns {Object} PLM payload
     */
    buildStylePayload(data) {
        const {
            brandId,
            divisionId,
            categoryId,
            subCategoryId,
            subSubCategoryId,
            userDefinedField2Id,
            seasonId,
            name,
            styleCode,
            description,
            // ID Generation fields (from DocLib lookup data)
            brandName,
            brandCode,
            seasonName,
            seasonCode,
            subSubCategoryCode
        } = data;

        return {
            key: "0",
            userId: config.plm.userId,
            notificationMessageKey: "CREATED_STYLE_OVERVIEW",
            fieldValues: [
                {
                    fieldName: "BrandId",
                    value: String(brandId)
                },
                {
                    fieldName: "DivisionId",
                    value: String(divisionId)
                },
                {
                    fieldName: "CategoryId",
                    value: String(categoryId)
                },
                {
                    fieldName: "SeasonId",
                    value: String(seasonId)
                },
                {
                    fieldName: "SubCategoryId",
                    value: String(subCategoryId)
                },
                {
                    fieldName: "ProductSubSubCategoryId",
                    value: String(subSubCategoryId)
                },
                {
                    fieldName: "UserDefinedField2Id",
                    value: userDefinedField2Id ? String(userDefinedField2Id) : null
                },
                {
                    fieldName: "CreateId",
                    value: config.plm.userId
                },
                {
                    fieldName: "AcqCode",
                    value: 1
                },
                {
                    fieldName: "IsFfPhantom",
                    value: 1
                },
                {
                    fieldName: "IsNosItem",
                    value: 1
                },
                {
                    fieldName: "IsModified",
                    value: 1
                },
                {
                    fieldName: "SizeCodeAndName",
                    value: ""
                },
                {
                    fieldName: "Original_Name",
                    value: ""
                },
                {
                    fieldName: "Original_Description",
                    value: ""
                },
                // Optional fields
                {
                    fieldName: "StyleCode",
                    value: styleCode || null
                },
                {
                    fieldName: "Name",
                    value: null
                },
                {
                    fieldName: "Description",
                    value: description || null
                }
            ],
            idGenContextVal: JSON.stringify([
                brandCode || "", // Brand CODE
                seasonName ? seasonName.replace(/\s+/g, '') : "", // Season NAME (boşluksuz)
                subSubCategoryCode || "" // SubSubCategory CODE
            ]),
            idGenContextVal2: JSON.stringify([
                {
                    FieldName: "SeasonId",
                    Value: seasonId
                },
                {
                    FieldName: "ProductSubSubCategoryId",
                    Value: subSubCategoryId
                }
            ]),
            idGenVal: [],
            subEntities: [
                {
                    key: 0,
                    fieldValues: [
                        {
                            fieldName: "Status",
                            value: 1
                        }
                    ]
                },
                {
                    key: 0,
                    subEntity: "StyleColorways",
                    fieldValues: [
                        {
                            fieldName: "Colors",
                            value: null
                        }
                    ]
                },
                {
                    key: 0,
                    subEntity: "StyleBOM",
                    fieldValues: [
                        {
                            fieldName: "MainMaterialName",
                            value: null
                        }
                    ]
                }
            ],
            modifyId: String(config.plm.userId),
            locale: "en-US",
            isGenAiGenerated: false,
            Schema: config.plm.schema
        };
    }
}

// Export singleton instance
module.exports = new StyleService();
