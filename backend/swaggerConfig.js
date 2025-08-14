// swaggerConfig.js
const swaggerJSDoc = require('swagger-jsdoc');
const fs = require('fs');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce API',
      version: '1.0.0',
    },
  },
  apis: ['./routes/*.js'], // path to your route annotations
};

const swaggerSpec = swaggerJSDoc(options);

// Save to swagger.json
fs.writeFileSync('./swagger.json', JSON.stringify(swaggerSpec, null, 2));

console.log('✅ swagger.json file generated');
