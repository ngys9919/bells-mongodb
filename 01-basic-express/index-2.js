// require() allows us to add a module to our current JavaScript
// and it will return the module and assign to the variable
// the require() will take in one parameter, which is the
// directory name of the module and relative to 'node_modules'
const express = require('express');
const cors = require('cors');

// reminder: const is a variable that cannot be reassigned to
// In JS, as long as the variable won't be reassigned, we'll use `const`
const app = express();  // create a new Express application

// setup CORS security
app.use(cors());


// ROUTES MUST BE AFTER YOUR LAST app.use()
// AND BEFORE app.listen()

// app.get() -> HTTP GET method
// "/" -> the "/" URL on the server
//
// second parameter: annoymous function
// first parameter - the request (aka what the client send to the server)
// second parameter - the response (what the server sends back to the client)
app.get("/", function(req,res){
    // send back a response using the `res` object
    res.json({
        "message":"hello World!"
    })
})

app.get("/quote-of-the-day", function(req, res){
    res.json({
        "quote":"The early bird got to board the shuttle bus"
    })
})

// the :name is a placeholder (i.e URL parameter)
app.get("/hello/:firstName", function(req,res){
    // we use req.params to access the placeholder
    let name = req.params.firstName;
    res.json({
        "message":"Hello " + name
    })
})

app.get("/addTwo/:number1/:number2", function(req,res){
    let n1 = req.params.number1;
    let n2 = req.params.number2;
    // very important; all URL parameters are strings
    let sum = Number(n1) + Number(n2);
    res.json({
        "message":"The sum is " + sum
    })
})

// assume user is going a query string with two keys: cuisine and time
// eg. http://server-url.com/recipes?cuisine=chinese&time=60
app.get("/recipes", function(req, res){
    console.log(req.query);
    let cuisine = req.query.cuisine;
    let time = req.query.time;
    res.json({
        "cuisine": cuisine,
        "time": time
    })
})


// start server using the listen function
// first parameter: the PORT number to run the server on
// second parameter: callback function for when the server is started successful
app.listen(3000, function(){
    console.log("Server started")
})
