// Token Service - OAuth 2.0 Authentication
const axios = require('axios');
const config = require('../config/config');

class TokenService {
    constructor() {
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    /**
     * Get access token using OAuth 2.0 Password Grant flow
     * @returns {Promise<string>} Access token
     */
    async getToken() {
        // Check if we have a valid token
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            console.log('✓ Using cached token');
            return this.accessToken;
        }

        try {
            console.log('🔑 Requesting new token...');
            console.log('Token URL:', config.oauth.tokenUrl);

            const response = await axios.post(
                config.oauth.tokenUrl,
                new URLSearchParams({
                    grant_type: 'password',
                    username: config.oauth.serviceAccountKey,
                    password: config.oauth.serviceAccountSecret,
                    client_id: config.oauth.clientId,
                    client_secret: config.oauth.clientSecret
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            this.accessToken = response.data.access_token;
            
            // Set token expiry (subtract 60 seconds for safety margin)
            const expiresIn = response.data.expires_in || 3600;
            this.tokenExpiry = Date.now() + (expiresIn - 60) * 1000;

            console.log('✅ Token successfully obtained');
            console.log(`⏰ Token expires in: ${expiresIn} seconds`);

            return this.accessToken;
        } catch (error) {
            console.error('❌ Error getting token:');
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
            } else {
                console.error('Message:', error.message);
            }
            throw error;
        }
    }

    /**
     * Clear cached token (force refresh on next request)
     */
    clearToken() {
        this.accessToken = null;
        this.tokenExpiry = null;
        console.log('🗑️  Token cache cleared');
    }

    /**
     * Get token info (for debugging)
     */
    getTokenInfo() {
        return {
            hasToken: !!this.accessToken,
            expiresAt: this.tokenExpiry ? new Date(this.tokenExpiry).toISOString() : null,
            isValid: this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry
        };
    }
}

// Export singleton instance
module.exports = new TokenService();
