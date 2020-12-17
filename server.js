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

//for ComputerVision API
'use strict';

const async = require('async');
const fs = require('fs');
const https = require('https');
const path = require("path");
const createReadStream = require('fs').createReadStream
const sleep = require('util').promisify(setTimeout);
const ComputerVisionClient = require('@azure/cognitiveservices-computervision').ComputerVisionClient;
const ApiKeyCredentials = require('@azure/ms-rest-js').ApiKeyCredentials;
// </snippet_imports>

const key = 'a9c6e7cc400340dba71245996fdab8f3';
const endpoint = 'https://final.cognitiveservices.azure.com/';
// </snippet_vars>

// <snippet_client>
const computerVisionClient = new ComputerVisionClient(
  new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } }), endpoint);


const options = {
  swaggerDefinition: {
    info: {
      title: 'API',
      version: '1.0.0',
      description: 'API for FinaL'
    },
    host: '64.225.9.197:3000',
    basePath: '/',
  },
  apis: ['./server.js'],
}
const specs = swaggerJsdoc(options);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));

app.post('/photo/faces', function (req, res, next) {
  async.series([
    async function () {
      const facesImageURL = (await req.body.url);
      const faces = (await computerVisionClient.analyzeImage(facesImageURL, { visualFeatures: ['Faces'] })).faces;
      computerVisionClient.analyzeImageInStream

      res.send(faces);
    },
    function () {
      return new Promise((resolve) => {
        resolve();
      })
    }
    ], (err) => {
    throw (err);
  });
});

app.post('/photo/objects', function (req, res, next) {
  // req.file is the `avatar` file
  async.series([
    async function () {
      const objectURL = (await req.body.url);
      const objects = (await computerVisionClient.analyzeImage(objectURL, { visualFeatures: ['Objects'] })).objects;

      res.send(objects);
    },
    function () {
      return new Promise((resolve) => {
        resolve();
      })
    }
    ], (err) => {
    throw (err);
  });
})

app.post('/photo/readPrintedText', function (req, res, next) {
    async.series([
    async function () {

      const STATUS_SUCCEEDED = "succeeded";
      const STATUS_FAILED = "failed"

      const printedTextURL = (await req.body.url);

      const operationLocationUrl = await computerVisionClient.read(printedTextURL)
        .then((response) => {
          return response.operationLocation;
        });

      // From the operation location URL, grab the last element, the operation ID.
      const operationIdUrl = operationLocationUrl.substring(operationLocationUrl.lastIndexOf('/') + 1);

      // Wait for the read operation to finish, use the operationId to get the result.
      while (true) {
        const readOpResult = await computerVisionClient.getReadResult(operationIdUrl)
          .then((result) => {
            return result;
          })

        if (readOpResult.status === STATUS_FAILED) {
          console.log('The Read File operation has failed.')
          break;
        }
        if (readOpResult.status === STATUS_SUCCEEDED) {

          var fin = "";
          for (const textRecResult of readOpResult.analyzeResult.readResults) {
            for (const line of textRecResult.lines) {
              var fin = fin + line.text + '\n';
            }
          }
          res.send(fin);
          break;
        }
        await sleep(1000);
      }
      console.log();
    },
    function () {
      return new Promise((resolve) => {
        resolve();
      })
    }
    ], (err) => {
    throw (err);
  });
  })

  app.post('/photo/faces', upload.single('avatar'), function (req, res, next) {
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

  var cpUpload = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 8 }])
  app.post('/cool-profile', cpUpload, function (req, res, next) {
  // req.files is an object (String -> Array) where fieldname is the key, and the value is array of files
  //
  // e.g.
  //  req.files['avatar'][0] -> File
  //  req.files['gallery'] -> Array
  //
  // req.body will contain the text fields, if there were any
  })

//"Name" "Action" "Place" (people waiting at a train station)
//"Name" "Action" (Jamie Campbell Bower posing for the camera)

/** 
* @swagger 
*
* /photo/objects: 
*    post: 
*       description: Returns rectangle, type of object and confidence of result.  Rectanlge being an array of the four vertices of the rectangle where the object is found. 
*       products: 
*           - application/json 
*       parameters:
*           - name: url
*             in: header
*             required: true
*             schema:
*                 type: String
*             description: Direct url to an image with objects
*       responces: 
*           200: 
*               description: Array containing 1 array of ints, 1 sting and 1 double for each object
* 
* /photo/readPrintedText: 
*    post: 
*       description: Returns all text in an image 
*       products: 
*           - application/json 
*       parameters:
*           - name: url
*             in: header
*             required: true
*             schema:
*                 type: String
*             description: Direct url to an image with printed text
*       responces: 
*           200: 
*               description: Line seperated string values
* 
* /photo/faces: 
*    post: 
*       description: Returns age, gender and faceRectangle coordinates.  FaceRectanlge being an array of the four vertices of the rectangle where the face is found.
*       products: 
*           - application/json 
*       parameters:
*           - name: url
*             in: header
*             required: true
*             schema:
*                 type: String
*             description: Direct url to an image with faces
*       responces: 
*           200: 
*               description: Array containing 1 sting, 1 int and 1 array of ints for each face
*/

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})