// require() allows us to add a module to our current JavaScript
// and it will return the module and assign to the variable
// the require() will take in one parameter, which is the
// directory name of the module and relative to 'node_modules'

const express = require('express');

const cors = require('cors');

// create a new Express application
const app = express();

// setup CORS security
app.use(cors());

// start server using the listen function
// first parameter: the PORT number to run the server on
// second parameter: callback function for when the server is started successful
app.listen(3000, function() {
    console.log("Server started");
})

