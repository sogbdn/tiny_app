//_____________Use Express = FramWork to build web app_______________//
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const PORT = 8080; //___________ default port 8080
const app = express(); //_________My App is running with Express

//_______Use body Parser to access POST request parameters
//_______ parsed entire body to JS object
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//___________ Tells Express app to use EJS as its templating engine
app.set("view engine", "ejs");

//________Use UUID to generate random string____________________________//
const uuidv1 = require("uuid/v1");

//_________MY DATABASE OBJECT = urlDatabase _____________________________//
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//________________USERS DATABASE___________________
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// function that produces a string of 6 random alphanumeric characters:
function generateRandomString() {
   return uuidv1().substr(0, 6);
}

const createUser = (email, password) => {
  // generate a random id
  const userId = generateRandomString();

 
  // Create a new user object
  // add the new user object to the users db
  // Return the new user object
  const newUser = {
    id: userId,
    email: email,
    password: password,
  };
  users[userId] = newUser;
  return userId;
};
 // Maybe later on I should I might change this function to check password as well
const findUser = email => {
  // loop the existing user objects
  // Then return the userId
  for (const userId in users) {
    if (users[userId].email === email) {
      return userId;
    }
  }
  return false;
  // if the email is the same then I got the right user
  // Then assign its user id to userId
 
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
  let templateVars = { urls: urlDatabase, user: req.cookies.user_id};

  //passing username to each EJS template so that it knows if the user logged in and username
  res.render("urls_index", templateVars);
});

// Add GET route to show the form in the wb page
app.get("/urls/new", (req, res) => {
  res.render('urls_new'); 
});

// Register endpoints

// Display the register form
app.get('/register', (req, res) => {
  res.cookie('user id', userId);
  res.redirect('/urls');  
  res.render('register');
});

// Create a new user
app.post('/register', (req, res) => {
  // Extract the info from th form information; email and passport
  const email = req.body.email;
  const password = req.body.password;
  const email_password_empty = !email || !password;

// If the email or password are empty strings
// send back a response with the 400 status
  if (email_password_empty) {
    res.status(400).send('Please fill out all the fields');
  } else if (emailExists(email)) { 
  res.status(400).send('That email already exists. Please Login');
  } else {
  // create a new user and add it to the global users
  const userId = createUser(email, password); 
  // set a cookie with the userId
  res.cookie('userId, userId');
  // redirect to '/urls'
  res.redirect('/urls');
  };
});

// Endpoint Edit URL form
app.get("/urls/:id", (req, res) => {
  let templateVars = { longURL: urlDatabase[req.params.id], shortURL: req.params.id, username: req.cookies.username};
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
 });

// Add an endpoint to handle a POST to /login
app.post("/login", (req, res) => {
  res.cookie("user_id", req.body.username);
  res.redirect('/urls'); // redirect client to home page
});

// Implement the /logout endpoint so that it clears the username cookie and redirects /urls page
app.post("/logout", (req, res) => {
  res.cookie('user_id', null);
  res.redirect('/urls'); // redirect client to home page
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

