// Configuration Management
require('dotenv').config();

const config = {
    // Environment
    env: process.env.PLM_ENV || 'test',
    
    // PLM Configuration (Hardcoded - TST Environment)
    plm: {
        tenant: 'ATJZAMEWEF5P4SNV_TST',
        schema: 'FSH4',
        userId: 6,
        userGuid: 'fc1f03e6-3bc7-4b51-a7d6-14e2f4818af9', // User GUID for x-infor-user header
        baseUrl: 'https://mingle-ionapi.eu1.inforcloudsuite.com/ATJZAMEWEF5P4SNV_TST/FASHIONPLM'
    },
    
    // OAuth 2.0 Configuration (Hardcoded from IPK_TST.ionapi)
    oauth: {
        clientId: 'ATJZAMEWEF5P4SNV_TST~vlWkwz2P74KAmRFfihVsdK5yjnHvnfPUrcOt4nl6gkI',
        clientSecret: 'HU1TUcBOX1rkp-uuYKUQ3simFEYzPKNM-XIyf4ewIxe-TYUZOK7RAlXUPd_FwSZMAslt8I9RZmv23xItVKY8EQ',
        serviceAccountKey: 'ATJZAMEWEF5P4SNV_TST#5d3TLFCMqK_CR9wmWsLbIn1UnLv2d8S0ohtIX4TZ4PUBXyvtx-RjHjscLzfB9NBAGZfdWMgzFt3DCpWoJMOHEg',
        serviceAccountSecret: 'g0oBJ4ubPxJwgJZjAxAfguExlH3V5-cFF0zove_9Fb_7h4C67eXko45T9Ltjw-DYzfYUbU_iQbCZuTW6wYeX5Q',
        tokenUrl: 'https://mingle-sso.eu1.inforcloudsuite.com:443/ATJZAMEWEF5P4SNV_TST/as/token.oauth2'
    },
    
    // Server Configuration
    server: {
        port: parseInt(process.env.PORT || '3000') // Heroku sets PORT automatically
    },
    
    // API Headers (Hardcoded - TST Environment)
    headers: {
        'x-fplm-schema': 'FSH4',
        'x-fplm-timezone-offset': '-180',
        'x-infor-tenantid': 'ATJZAMEWEF5P4SNV_TST',
        'x-infor-user': 'fc1f03e6-3bc7-4b51-a7d6-14e2f4818af9',
        'x-fplm-client': '1',
        'x-fplm-client-version': '16.0.32',
        'x-fplm-idm-access': '1',
        'x-fplm-client-locale': 'en-US'
    }
};

module.exports = config;
