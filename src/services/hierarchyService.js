// Hierarchy Service - Organization Level Data Management with Tree Traversal
const axios = require('axios');
const config = require('../config/config');
const tokenService = require('./tokenService');

class HierarchyService {
    constructor() {
        this.baseUrl = config.plm.baseUrl;
        // In-memory cache with TTL
        this.cache = new Map();
        this.ttl = 24 * 60 * 60 * 1000; // 24 hours
        this.fullHierarchyCache = null;
        this.fullHierarchyCacheTimestamp = null;
    }

    /**
     * Fetch all organization level hierarchy from PLM
     * @returns {Promise<Object>} Full hierarchy data
     */
    async fetchFullHierarchy() {
        try {
            console.log('\n🏗️  Fetching full hierarchy from PLM...');
            const startTime = Date.now();
            
            // Get access token
            const token = await tokenService.getToken();
            
            // Build endpoint URL
            const endpoint = `${this.baseUrl}/view/api/view/entity/data/get`;
            
            // Build payload
            const payload = {
                roleId: 1,
                userId: config.plm.userId,
                personalizationId: 0,
                pageType: "list",
                locale: "en-US",
                entities: [
                    {
                        name: "OrgLevel",
                        parent: null,
                        columns: [
                            "GLReferenceId",
                            "Code",
                            "Name",
                            "Description",
                            "CreateDate",
                            "ModifyDate",
                            "Tags",
                            "OrgLevelId",
                            "ParentId",
                            "Level",
                            "Path",
                            "GLValueId"
                        ],
                        lookupRef: [],
                        searchable: [
                            "GLReferenceId",
                            "Code",
                            "Name",
                            "Description",
                            "CreateDate",
                            "ModifyDate",
                            "Tags"
                        ],
                        dataFilter: {
                            Conditions: []
                        },
                        pageInfo: {},
                        sortInfo: null,
                        ignoreMetadata: false,
                        extendedFields: []
                    }
                ],
                Schema: config.plm.schema
            };
            
            // Make API request
            const response = await axios.post(endpoint, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    ...config.headers
                }
            });

            const elapsed = Date.now() - startTime;
            console.log(`✅ Full hierarchy retrieved in ${elapsed}ms`);
            
            return {
                success: true,
                data: response.data,
                elapsed: elapsed
            };
            
        } catch (error) {
            console.error('❌ Error fetching hierarchy:');
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Status Text:', error.response.statusText);
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
     * Get full hierarchy with caching
     * @returns {Promise<Object>} Cached or fresh hierarchy data
     */
    async getFullHierarchy() {
        // Check cache
        if (this.fullHierarchyCache && 
            this.fullHierarchyCacheTimestamp && 
            Date.now() - this.fullHierarchyCacheTimestamp < this.ttl) {
            const age = Math.round((Date.now() - this.fullHierarchyCacheTimestamp) / 1000);
            console.log(`✅ Using cached hierarchy (age: ${age}s)`);
            return {
                success: true,
                data: this.fullHierarchyCache,
                cached: true,
                cacheAge: age
            };
        }

        // Fetch fresh data
        console.log('❌ Cache MISS - Fetching fresh hierarchy data');
        const result = await this.fetchFullHierarchy();
        
        if (result.success) {
            // Cache the result
            this.fullHierarchyCache = result.data;
            this.fullHierarchyCacheTimestamp = Date.now();
            console.log('💾 Hierarchy cached successfully');
        }
        
        return {
            ...result,
            cached: false
        };
    }

    /**
     * Find node in tree by Brand and SubSubCategory
     * @param {Object} node - Current node
     * @param {number} brandId - Brand GLValueId to find
     * @param {number} subSubCategoryId - SubSubCategory GLValueId to find
     * @param {Array} path - Current path (for tracking)
     * @returns {Object|null} Found node with path or null
     */
    findNodeInTree(node, brandId, subSubCategoryId, path = []) {
        // Add current node to path
        const currentPath = [...path, {
            level: node.Level,
            glRefId: node.GLReferenceId,
            glValueId: node.GLValueId,
            name: node.Name,
            code: node.Code
        }];

        // Check if this is the target SubSubCategory
        // Level 4 = SubSubCategory (GLReferenceId: 69)
        if (node.Level === 4 && node.GLReferenceId === 69 && node.GLValueId === subSubCategoryId) {
            // Verify that the path contains the correct brand
            const brandNode = currentPath.find(n => n.level === 0 && n.glRefId === 1);
            if (brandNode && brandNode.glValueId === brandId) {
                console.log(`✅ Found match! Brand: ${brandNode.name} (${brandId}), SubSubCat: ${node.Name} (${subSubCategoryId})`);
                
                // Add Level 5 (UserDefinedField2) if it exists in children
                let finalPath = currentPath;
                if (node.Children && node.Children.length > 0) {
                    // Find the first Level 5 child (UserDefinedField2)
                    const level5Child = node.Children.find(child => child.Level === 5 && child.GLReferenceId === 73);
                    if (level5Child) {
                        finalPath = [...currentPath, {
                            level: level5Child.Level,
                            glRefId: level5Child.GLReferenceId,
                            glValueId: level5Child.GLValueId,
                            name: level5Child.Name,
                            code: level5Child.Code
                        }];
                        console.log(`✅ Found UserDefinedField2: ${level5Child.Name} (${level5Child.GLValueId})`);
                    }
                }
                
                return {
                    found: true,
                    path: finalPath,
                    node: node
                };
            }
        }

        // Recursively search children
        if (node.Children && node.Children.length > 0) {
            for (const child of node.Children) {
                const result = this.findNodeInTree(child, brandId, subSubCategoryId, currentPath);
                if (result && result.found) {
                    return result;
                }
            }
        }

        return null;
    }

    /**
     * Extract hierarchy IDs from path
     * @param {Array} path - Path from findNodeInTree
     * @returns {Object} Extracted IDs
     */
    extractIdsFromPath(path) {
        const result = {
            brandId: null,
            divisionId: null,
            categoryId: null,
            subCategoryId: null,
            subSubCategoryId: null,
            userDefinedField2Id: null
        };

        path.forEach(node => {
            switch (node.level) {
                case 0: // Brand (GLRefId: 1)
                    if (node.glRefId === 1) {
                        result.brandId = node.glValueId;
                    }
                    break;
                case 1: // Division (GLRefId: 90)
                    if (node.glRefId === 90) {
                        result.divisionId = node.glValueId;
                    }
                    break;
                case 2: // Category (GLRefId: 51)
                    if (node.glRefId === 51) {
                        result.categoryId = node.glValueId;
                    }
                    break;
                case 3: // SubCategory (GLRefId: 65)
                    if (node.glRefId === 65) {
                        result.subCategoryId = node.glValueId;
                    }
                    break;
                case 4: // SubSubCategory (GLRefId: 69)
                    if (node.glRefId === 69) {
                        result.subSubCategoryId = node.glValueId;
                    }
                    break;
                case 5: // UserDefinedField2 (GLRefId: 73)
                    if (node.glRefId === 73) {
                        result.userDefinedField2Id = node.glValueId;
                    }
                    break;
            }
        });

        return result;
    }

    /**
     * Get hierarchy info for specific Brand + SubSubCategory
     * @param {number} brandId - Brand ID (GLValueId)
     * @param {number} subSubCategoryId - SubSubCategory ID (GLValueId)
     * @returns {Promise<Object>} Hierarchy info (Division, Category, SubCategory, UserDefinedField2)
     */
    async getHierarchyInfo(brandId, subSubCategoryId) {
        const cacheKey = `${brandId}-${subSubCategoryId}`;
        
        console.log(`\n🔍 Looking up hierarchy for Brand: ${brandId}, SubSubCategory: ${subSubCategoryId}`);
        
        // Check specific cache
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.ttl) {
            console.log(`✅ Cache HIT for ${cacheKey}`);
            return {
                ...cached.data,
                fromCache: true
            };
        }

        console.log(`❌ Cache MISS for ${cacheKey}`);
        
        // Get full hierarchy (with cache)
        const hierarchyResult = await this.getFullHierarchy();
        
        if (!hierarchyResult.success) {
            return {
                success: false,
                error: 'Failed to fetch hierarchy'
            };
        }

        // Get root nodes
        const entities = hierarchyResult.data.entities || [];
        if (entities.length === 0) {
            return {
                success: false,
                error: 'No entities in hierarchy data'
            };
        }

        // Search through all brand nodes (multiple entities for different brands)
        let foundPath = null;
        
        for (const entity of entities) {
            if (entity.name === 'OrgLevel' && entity.column) {
                // This is a root brand node
                const result = this.findNodeInTree(entity.column, brandId, subSubCategoryId);
                if (result && result.found) {
                    foundPath = result.path;
                    break;
                }
            }
        }

        if (!foundPath) {
            console.log(`❌ No matching path found for Brand: ${brandId}, SubSubCategory: ${subSubCategoryId}`);
            return {
                success: false,
                error: `No matching hierarchy found for Brand ${brandId} and SubSubCategory ${subSubCategoryId}`
            };
        }

        // Extract IDs from path
        const ids = this.extractIdsFromPath(foundPath);
        
        console.log('📊 Extracted IDs:', ids);

        const result = {
            success: true,
            brandId: ids.brandId,
            divisionId: ids.divisionId,
            categoryId: ids.categoryId,
            subCategoryId: ids.subCategoryId,
            subSubCategoryId: ids.subSubCategoryId,
            userDefinedField2Id: ids.userDefinedField2Id,
            path: foundPath.map(n => `${n.name} (L${n.level})`).join(' → '),
            fromCache: false
        };

        // Cache the result
        this.cache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });
        console.log(`💾 Cached result for ${cacheKey}`);

        return result;
    }

    /**
     * Clear all caches
     */
    clearCache() {
        this.cache.clear();
        this.fullHierarchyCache = null;
        this.fullHierarchyCacheTimestamp = null;
        console.log('🗑️  All hierarchy caches cleared');
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            specificCacheSize: this.cache.size,
            fullHierarchyCached: !!this.fullHierarchyCache,
            fullHierarchyAge: this.fullHierarchyCacheTimestamp 
                ? Math.round((Date.now() - this.fullHierarchyCacheTimestamp) / 1000) 
                : null
        };
    }
}

// Export singleton instance
module.exports = new HierarchyService();
