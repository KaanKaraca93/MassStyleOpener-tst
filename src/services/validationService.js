// Validation Service - Quality Control for Style Creation
class ValidationService {
    /**
     * Validate DocLib data for required fields
     * @param {Object} docLibData - DocLib data to validate
     * @returns {Object} Validation result
     */
    validateDocLibData(docLibData) {
        const errors = [];
        const warnings = [];

        // Required fields for Style creation
        const requiredFields = [
            { field: 'brandId', name: 'Brand' },
            { field: 'seasonId', name: 'Season' },
            { field: 'subSubCategoryId', name: 'SubSubCategory' }
        ];

        // Check required fields
        requiredFields.forEach(({ field, name }) => {
            if (!docLibData[field] || docLibData[field] === null) {
                errors.push(`${name} is required but missing (${field} is null)`);
            }
        });

        // Check lookup data for ID generation
        if (!docLibData.brandCode || !docLibData.brandCode.trim()) {
            warnings.push('Brand Code is missing - ID generation may fail');
        }
        if (!docLibData.seasonName || !docLibData.seasonName.trim()) {
            warnings.push('Season Name is missing - ID generation may fail');
        }
        if (!docLibData.subSubCategoryCode || !docLibData.subSubCategoryCode.trim()) {
            warnings.push('SubSubCategory Code is missing - ID generation may fail');
        }

        const isValid = errors.length === 0;

        return {
            valid: isValid,
            errors: errors,
            warnings: warnings,
            reason: isValid ? null : errors.join(', ')
        };
    }

    /**
     * Validate Hierarchy mapping result
     * @param {Object} hierarchyData - Hierarchy mapping result
     * @returns {Object} Validation result
     */
    validateHierarchyMapping(hierarchyData) {
        const errors = [];
        const warnings = [];

        // Check if hierarchy mapping was successful
        if (!hierarchyData.success) {
            errors.push('Hierarchy mapping failed: ' + (hierarchyData.error || 'Unknown error'));
            return {
                valid: false,
                errors: errors,
                warnings: warnings,
                reason: 'Hierarchy mapping failed'
            };
        }

        // Check required hierarchy fields
        const requiredFields = [
            { field: 'divisionId', name: 'Division' },
            { field: 'categoryId', name: 'Category' },
            { field: 'subCategoryId', name: 'SubCategory' }
        ];

        requiredFields.forEach(({ field, name }) => {
            if (!hierarchyData[field] || hierarchyData[field] === null) {
                errors.push(`${name} not found in hierarchy (${field} is null)`);
            }
        });

        // UserDefinedField2 is optional but recommended
        if (!hierarchyData.userDefinedField2Id) {
            warnings.push('UserDefinedField2 not found in hierarchy - may affect style creation');
        }

        const isValid = errors.length === 0;

        return {
            valid: isValid,
            errors: errors,
            warnings: warnings,
            reason: isValid ? null : errors.join(', ')
        };
    }

    /**
     * Log validation result
     * @param {string} stage - Validation stage name
     * @param {Object} validation - Validation result
     */
    logValidation(stage, validation) {
        if (validation.valid) {
            console.log(`✅ ${stage} validation PASSED`);
            if (validation.warnings && validation.warnings.length > 0) {
                console.log(`⚠️  Warnings: ${validation.warnings.length}`);
                validation.warnings.forEach(w => console.log(`   - ${w}`));
            }
        } else {
            console.log(`❌ ${stage} validation FAILED`);
            console.log(`📋 Errors: ${validation.errors.length}`);
            validation.errors.forEach(e => console.log(`   - ${e}`));
            if (validation.warnings && validation.warnings.length > 0) {
                console.log(`⚠️  Warnings: ${validation.warnings.length}`);
                validation.warnings.forEach(w => console.log(`   - ${w}`));
            }
        }
    }
}

// Export singleton instance
module.exports = new ValidationService();
