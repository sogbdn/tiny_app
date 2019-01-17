//_____________Use Express = FramWork to build web app_______________//
const express = require("express");
const app = express(); //_________My App is running with Express
const PORT = 8080; //___________ default port 8080

//___________ Tells the Express app to use EJS as its templating engine
app.set("view engine", "ejs");

//_______Use body Parser to access POST request parameters
//_______ parsed entire body to JS object
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//________Use UUID to generate random string____________________________//
const uuidv1 = require("uuid/v1");

//_________MY DATABASE OBJECT = urlDatabase _____________________________//
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",

};

// function that produces a string of 6 random alphanumeric characters:
function generateRandomString() {
   return uuidv1().substr(0, 6);
}

// app.get to add a new route handler
// this lines registers a handler on the root path
app.get("/", (req, res) => {
  res.send("Hello!");
});
// sending HTML
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// New route handler with render to pass the URL data to your template ejs
// data are always an object, created before sending
// Route order: most specific to less specific

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});


// Add GET route to show the form in the wb page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get("/urls/:id", (req, res) => {
  let templateVars = { longURL: urlDatabase[req.params.id], shortURL: req.params.id};
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// logs the request body and gives a response parsed into a JS object
//
app.post("/urls", (req, res) => {
  let rNumber = generateRandomString();
  urlDatabase[rNumber] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect('/urls'); // redirect to home home page
});


// Add a POST route that removes a URL resource from request: /urls/:id/delete
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls'); // redirect client to home page
});

// Add a POST route that update a URL resource: /urls/:id/update
app.post("/urls/:id/update", (req, res) => {
// Update database with req.body, in the new field  
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


