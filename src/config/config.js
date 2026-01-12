// Configuration Management
require('dotenv').config();

const config = {
    // Environment
    env: process.env.PLM_ENV || 'production',
    
    // PLM Configuration (Hardcoded - PRD Environment)
    plm: {
        tenant: 'ATJZAMEWEF5P4SNV_PRD',
        schema: 'FSH2',
        userId: 6,
        userGuid: 'fc1f03e6-3bc7-4b51-a7d6-14e2f4818af9', // User GUID for x-infor-user header
        baseUrl: 'https://mingle-ionapi.eu1.inforcloudsuite.com/ATJZAMEWEF5P4SNV_PRD/FASHIONPLM'
    },
    
    // OAuth 2.0 Configuration (Hardcoded from IPK_PRD.ionapi)
    oauth: {
        clientId: 'ATJZAMEWEF5P4SNV_PRD~zWbsEgkMBlqdSXoSAXBiM8V1POA0-2Mkn1qkORhxma0',
        clientSecret: 'Ll2ehfOJ14uXzyLwR-6BIUmnQNFfhSFRadOzhfzIgK8DBs0x8_AQ3vqbiNrCVOfTyN3_v_Vyf1Yq4WMA7F68hg',
        serviceAccountKey: 'ATJZAMEWEF5P4SNV_PRD#fAzHs-Kdtut0xOXsRx1rnc4kB9icdTJ25HPE65-3-Q0G477cLbXRgPOsL0JjhQCA2VlgbJvK400_9ZaezhMKIQ',
        serviceAccountSecret: 'Bd7aqwQd7K8Xw8uMLffxlNrM8oROajrY18EVpPalakqECxXs5HzFzZoT45JBKtUGZvfacr8bCrgCmgscu71rTA',
        tokenUrl: 'https://mingle-sso.eu1.inforcloudsuite.com:443/ATJZAMEWEF5P4SNV_PRD/as/token.oauth2'
    },
    
    // Server Configuration
    server: {
        port: parseInt(process.env.PORT || '3000') // Heroku sets PORT automatically
    },
    
    // API Headers (Hardcoded - matching curl requests)
    headers: {
        'x-fplm-schema': 'FSH2',
        'x-fplm-timezone-offset': '-180',
        'x-infor-tenantid': 'ATJZAMEWEF5P4SNV_PRD',
        'x-infor-user': 'fc1f03e6-3bc7-4b51-a7d6-14e2f4818af9',
        'x-fplm-client': '1',
        'x-fplm-client-version': '16.0.32',
        'x-fplm-idm-access': '1',
        'x-fplm-client-locale': 'en-US'
    }
};

module.exports = config;
