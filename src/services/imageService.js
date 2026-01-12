// Image Service - Image Download and Upload to PLM
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const tokenService = require('./tokenService');

class ImageService {
    constructor() {
        this.baseUrl = config.plm.baseUrl;
        this.tempDir = path.join(__dirname, '../../temp');
        
        // Create temp directory if it doesn't exist
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    /**
     * Download image from URL
     * @param {string} imageUrl - Image URL
     * @returns {Promise<string>} Local file path
     */
    async downloadImage(imageUrl) {
        try {
            console.log('\n📥 Downloading image...');
            console.log(`URL: ${imageUrl.substring(0, 100)}...`);
            
            const startTime = Date.now();
            
            // Extract filename from URL or generate one
            const urlParts = imageUrl.split('/');
            let filename = urlParts[urlParts.length - 1].split('?')[0] || 'image.png';
            
            // Ensure filename has extension
            if (!filename.includes('.')) {
                filename += '.png';
            }
            
            const localPath = path.join(this.tempDir, `temp_${Date.now()}_${filename}`);
            
            // Download image
            const response = await axios.get(imageUrl, {
                responseType: 'stream',
                timeout: 30000
            });
            
            // Save to file
            const writer = fs.createWriteStream(localPath);
            response.data.pipe(writer);
            
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
            
            const elapsed = Date.now() - startTime;
            const stats = fs.statSync(localPath);
            
            console.log(`✅ Image downloaded in ${elapsed}ms`);
            console.log(`📦 File size: ${(stats.size / 1024).toFixed(2)} KB`);
            console.log(`📁 Saved to: ${localPath}`);
            
            return localPath;
            
        } catch (error) {
            console.error('❌ Error downloading image:');
            console.error('Message:', error.message);
            throw error;
        }
    }

    /**
     * Upload file to PLM
     * @param {string} filePath - Local file path
     * @param {number} styleKey - Style key to attach image to
     * @returns {Promise<Object>} Upload result
     */
    async uploadFile(filePath, styleKey) {
        try {
            console.log('\n📤 Uploading file to PLM...');
            const startTime = Date.now();
            
            // Get access token
            const token = await tokenService.getToken();
            
            // Build endpoint URL
            const endpoint = `${this.baseUrl}/documents/api/document/UploadFile`;
            console.log(`📡 Endpoint: ${endpoint}`);
            
            // Get file info
            const filename = path.basename(filePath);
            const stats = fs.statSync(filePath);
            
            // Generate temp ID
            const tempId = this.generateUUID();
            
            // Build atta metadata - matching curl request
            const attaData = {
                objectFilePath: `blob:temp/${filename}`,
                objectExtension: null,
                sequence: 0,
                details: { 
                    name: null, 
                    note: null,
                    dlType: 11,
                    type: "styleImages"
                },
                referenceId: String(styleKey),
                modifyDate: "0001-01-01T00:00:00",
                code: "E0012", // Style images code
                isDefault: false,
                objectId: 0,
                originalObjectName: filename,
                objectStream: null,
                tempId: tempId
            };
            
            // Create form data - matching curl request order and values
            const form = new FormData();
            form.append('file', fs.createReadStream(filePath), {
                filename: filename,
                contentType: this.getContentType(filename)
            });
            form.append('atta', JSON.stringify(attaData));
            form.append('type', 'styleImages'); // not 'undefined'
            form.append('formType', 'file');
            form.append('schema', config.plm.schema);
            form.append('overwrite', 'false');
            
            // Make API request
            const response = await axios.post(endpoint, form, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    ...form.getHeaders(),
                    ...config.headers
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity
            });
            
            const elapsed = Date.now() - startTime;
            console.log(`✅ File uploaded successfully in ${elapsed}ms`);
            console.log('📋 Response:', JSON.stringify(response.data, null, 2));
            
            return {
                success: true,
                data: response.data,
                elapsed: elapsed,
                addedFile: response.data.addedFiles ? response.data.addedFiles[0] : null
            };
            
        } catch (error) {
            console.error('❌ Error uploading file:');
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
     * Save image metadata (attach to style)
     * @param {Object} fileInfo - File info from upload
     * @param {number} styleKey - Style key
     * @returns {Promise<Object>} Save result
     */
    async saveMetadata(fileInfo, styleKey) {
        try {
            console.log('\n💾 Saving image metadata...');
            const startTime = Date.now();
            
            // Get access token
            const token = await tokenService.getToken();
            
            // Build endpoint URL
            const endpoint = `${this.baseUrl}/documents/api/document/SaveMetadata`;
            console.log(`📡 Endpoint: ${endpoint}`);
            
            // Build payload - matching the curl request exactly
            const payload = {
                AttaFileListDto: [
                    {
                        objectFilePath: `blob:temp/${fileInfo.oldFileName || fileInfo.objectKey}`,
                        objectExtension: null,
                        sequence: 0,
                        details: {
                            name: null,
                            note: null,
                            dlType: 11,
                            type: "styleImages"
                        },
                        referenceId: String(styleKey),
                        modifyDate: "0001-01-01T00:00:00",
                        code: "E0012", // Style images code (not E0023 which is for materials)
                        isDefault: true,
                        objectId: 0,
                        originalObjectName: fileInfo.oldFileName || fileInfo.objectKey,
                        objectStream: null,
                        tempId: fileInfo.tempId,
                        objectKey: fileInfo.objectKey,
                        oldFileName: fileInfo.oldFileName || fileInfo.objectKey,
                        documentUrl: null,
                        thumbUrl: fileInfo.thumbUrl,
                        customUrl: fileInfo.customUrl,
                        type: "styleImages"
                    }
                ],
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
            
            const elapsed = Date.now() - startTime;
            console.log(`✅ Metadata saved successfully in ${elapsed}ms`);
            console.log('📋 Response:', JSON.stringify(response.data, null, 2));
            
            return {
                success: true,
                data: response.data,
                elapsed: elapsed
            };
            
        } catch (error) {
            console.error('❌ Error saving metadata:');
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
     * Full image upload flow (download, upload, attach)
     * @param {string} imageUrl - Image URL from DocLib
     * @param {number} styleKey - Style key to attach image to
     * @returns {Promise<Object>} Complete result
     */
    async uploadImageToStyle(imageUrl, styleKey) {
        let localPath = null;
        
        try {
            console.log('\n╔════════════════════════════════════════════════╗');
            console.log('║   IMAGE UPLOAD TO STYLE                       ║');
            console.log('╚════════════════════════════════════════════════╝');
            
            // Step 1: Download image
            localPath = await this.downloadImage(imageUrl);
            
            // Step 2: Upload file
            const uploadResult = await this.uploadFile(localPath, styleKey);
            
            if (!uploadResult.success) {
                return {
                    success: false,
                    error: 'File upload failed',
                    details: uploadResult
                };
            }
            
            if (!uploadResult.addedFile) {
                return {
                    success: false,
                    error: 'No file info in upload response'
                };
            }
            
            // Step 3: Save metadata
            const metadataResult = await this.saveMetadata(uploadResult.addedFile, styleKey);
            
            if (!metadataResult.success) {
                return {
                    success: false,
                    error: 'Metadata save failed',
                    details: metadataResult
                };
            }
            
            // Cleanup temp file
            this.cleanupFile(localPath);
            
            return {
                success: true,
                message: 'Image uploaded and attached to style successfully',
                objectKey: uploadResult.addedFile.objectKey,
                thumbUrl: uploadResult.addedFile.thumbUrl,
                customUrl: uploadResult.addedFile.customUrl
            };
            
        } catch (error) {
            // Cleanup temp file on error
            if (localPath) {
                this.cleanupFile(localPath);
            }
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Cleanup temporary file
     * @param {string} filePath - File path to delete
     */
    cleanupFile(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`🗑️  Temp file deleted: ${path.basename(filePath)}`);
            }
        } catch (error) {
            console.warn(`⚠️  Could not delete temp file: ${error.message}`);
        }
    }

    /**
     * Get content type based on file extension
     * @param {string} filename - Filename
     * @returns {string} Content type
     */
    getContentType(filename) {
        const ext = path.extname(filename).toLowerCase();
        const types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.bmp': 'image/bmp',
            '.webp': 'image/webp'
        };
        return types[ext] || 'application/octet-stream';
    }

    /**
     * Generate UUID v4
     * @returns {string} UUID
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

// Export singleton instance
module.exports = new ImageService();
