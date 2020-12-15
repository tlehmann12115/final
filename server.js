const express = require('express');
const bodyParser = require('body-parser');
const app = express();
// const sanitizer = require('express-auto-sanitize');
const { check, validationResult } = require('express-validator');
app.use(bodyParser.urlencoded({ extended: true })); 
//app.use(bodyParser.json()); 
//app.use(bodyParser.raw());
const port = 3000;
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

const options = {
  swaggerDefinition: {
    info: {
      title: 'API',
      version: '1.0.0',
      description: 'API for FinaL'
    },
    host: '161.35.55.4:3000', //Change
    basePath: '/',
  },
  apis: ['./server.js'],
}
const specs = swaggerJsdoc(options);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));

 
app.post('/photo/objects', upload.single('avatar'), function (req, res, next) {
  // req.file is the `avatar` file
  const axios = require('axios');

  axios.get('https://sqp58craj1.execute-api.us-east-2.amazonaws.com/prod/' + req.file)
    .then(function (response) {
      // handle success
      res.send(response.data);
      console.log(response.data);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
})

app.post('/photo/text', upload.single('avatar'), function (req, res, next) {
    // req.file is the `avatar` file
    const axios = require('axios');
  
    axios.get('https://sqp58craj1.execute-api.us-east-2.amazonaws.com/prod/' + req.file)
      .then(function (response) {
        // handle success
        res.send(response.data);
        console.log(response.data);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
  })

  app.post('/photo/celebrities', upload.single('avatar'), function (req, res, next) {
    // req.file is the `avatar` file
    const axios = require('axios');
  
    axios.get('https://sqp58craj1.execute-api.us-east-2.amazonaws.com/prod/' + req.file)
      .then(function (response) {
        // handle success
        res.send(response.data);
        console.log(response.data);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
  })

//"Name" "Action" "Place" (people waiting at a train station)
//"Name" "Action" (Jamie Campbell Bower posing for the camera)

/** 
* @swagger 
* /photo/objects: 
*    Post: 
*       description: Return all objects in a photo 
*       products: 
*           - application/json 
*       responces: 
*           200: 
*               description: Test
* 
* /photo/text: 
*    put: 
*       description: Returns all text in an image 
*       products: 
*           - application/json 
*       responces: 
*           200: 
*               description: String array
* 
* /photo/celebrities: 
*    patch: 
*       description: Returns name of celebrities in a photo and what they seems to be doing
*       products: 
*           - application/json 
*       responces: 
*           200: 
*               description: Test
*/