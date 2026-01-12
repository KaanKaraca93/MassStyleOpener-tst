// Configuration Management
require('dotenv').config();

const config = {
    // Environment
    env: process.env.PLM_ENV || 'production',
    
    // PLM Configuration
    plm: {
        tenant: process.env.PLM_TENANT || 'ATJZAMEWEF5P4SNV_PRD',
        schema: process.env.PLM_SCHEMA || 'FSH2',
        userId: parseInt(process.env.PLM_USER_ID || '6'),
        baseUrl: process.env.PLM_BASE_URL || 'https://mingle-ionapi.eu1.inforcloudsuite.com/ATJZAMEWEF5P4SNV_PRD/FASHIONPLM'
    },
    
    // OAuth 2.0 Configuration
    oauth: {
        clientId: process.env.PLM_CLIENT_ID || 'ATJZAMEWEF5P4SNV_PRD~zWbsEgkMBlqdSXoSAXBiM8V1POA0-2Mkn1qkORhxma0',
        clientSecret: process.env.PLM_CLIENT_SECRET || 'Ll2ehfOJ14uXzyLwR-6BIUmnQNFfhSFRadOzhfzIgK8DBs0x8_AQ3vqbiNrCVOfTyN3_v_Vyf1Yq4WMA7F68hg',
        serviceAccountKey: process.env.PLM_SERVICE_ACCOUNT_KEY || 'ATJZAMEWEF5P4SNV_PRD#fAzHs-Kdtut0xOXsRx1rnc4kB9icdTJ25HPE65-3-Q0G477cLbXRgPOsL0JjhQCA2VlgbJvK400_9ZaezhMKIQ',
        serviceAccountSecret: process.env.PLM_SERVICE_ACCOUNT_SECRET || 'Bd7aqwQd7K8Xw8uMLffxlNrM8oROajrY18EVpPalakqECxXs5HzFzZoT45JBKtUGZvfacr8bCrgCmgscu71rTA',
        tokenUrl: process.env.PLM_TOKEN_URL || 'https://mingle-sso.eu1.inforcloudsuite.com:443/ATJZAMEWEF5P4SNV_PRD/as/token.oauth2'
    },
    
    // Server Configuration
    server: {
        port: parseInt(process.env.PORT || '5000')
    },
    
    // API Headers
    headers: {
        'x-fplm-schema': process.env.PLM_SCHEMA || 'FSH2',
        'x-fplm-timezone-offset': '-180',
        'x-infor-tenantid': process.env.PLM_TENANT || 'ATJZAMEWEF5P4SNV_PRD'
    }
};

module.exports = config;
