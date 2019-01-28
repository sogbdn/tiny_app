// Express = FramWork to build web app
const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const PORT = 8080; // default port 8080
const app = express(); // App run with Express
const uuidv1 = require("uuid/v1"); // UUID to generate random string

// Middleware: bodyParser to access POST request parameters, parsed entire body to JS object)
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"]
  })
);
// Tells Express app to use EJS as its templating engine
app.set("view engine", "ejs");

// URL DATABASE
const urlDatabase = {
  b2xVn2: {
    shortUrl: "b2xVn2",
    longUrl: "http://www.lighthouselabs.ca",
    userId: "userRandomID"
  },
  "9sm5xK": {
    shortUrl: "9sm5xK",
    longUrl: "http://www.google.com",
    userId: "user2RandomID"
  }
};

// USERS DATABASE
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  user3RandomID: {
    id: "user3RandomID",
    email: "u@u.com",
    password: "u"
  }
};

// Function that produces a string of 6 random alphanumeric characters:
function generateRandomString() {
  return uuidv1().substr(0, 6);
}
// Create a new user and add it to the users db and return the userId
const createUser = (email, password) => {
  // generate a random id
  const userId = generateRandomString();
  // create a new user object
  const newUser = {
    id: userId,
    email: email,
    password: password
  };
  // add the new user object to the users db
  users[userId] = newUser;
  return userId;
};

const findUser = email => {
  // loop through the existing user objects
  for (const userId in users) {
    // if the email is the same then I got the right user
    // Then return the userId
    if (users[userId].email === email) {
      return userId;
    }
  }
  return false;
};

const emailExist = email => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return userId;
    }
  }
  return false;
};

function urlsForUsers(id) {
  const filteredUrls = {};
  for (const shortUrl in urlDatabase) {
    const urlObj = urlDatabase[shortUrl];
    if (urlObj.userId === id) {
      // url belongs to that user
      // the urlObj needs to be part of the filteredUrls object
      filteredUrls[shortUrl] = urlObj;
    }
  }
  return filteredUrls;
}

function addNewURL(shortUrl, longUrl, userId) {
  urlDatabase[shortUrl] = {
    shortUrl: shortUrl,
    longUrl: longUrl,
    userId: userId
  };
}

// app.get to add a new route handler on the root path
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// sending HTML
app.get("/hello", (req, res) => {
  res.send("<html><body> Hello <b> World </b></body></html>\n");
});

// END POINTS with render to pass the URL data to your template ejs: most specific to less specific
// data are always an object, created before sending
app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  }
  const userId = req.session["user_id"];
  const templateVars = {
    urls: urlsForUsers(userId),
    user: users[req.session.user_id]
  };
  //passing user_id to each template so that it knows if the user logged in
  res.render("urls_index", templateVars);
});

// GET route to show the form in the web page
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  }
  let templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  // console.log(user);
  res.render("urls_new", templateVars);
});

// REGISTER endpoints: display the register form
app.get("/register", (req, res) => {
  //res.redirect('/urls');
  res.render("register");
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users.user
  };
  res.render("login", templateVars);
});

// Create a new user
app.post("/register", (req, res) => {
  // Extract the info from form information; email and passport
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  // If the email or password are empty strings
  const email_password_empty = !email || !password;

  // send back a response with the 400 status
  if (email_password_empty) {
    res.status(400).send("Please fill out all the required fields!");
    // If someone tries to register with an existing user's email
  } else if (emailExist(email)) {
    res.status(400).send("That email already exists. Please Login!");
  } else {
    // create a new user and add it to the global users
    const userId = createUser(email, password);
    // set a cookie with the userId
    req.session.user_id = userId;
    // redirect to '/urls'
    res.redirect("/urls");
  }
});

// Endpoint Edit URL form
app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  }
  let templateVars = {
    longUrl: urlDatabase[req.params.id],
    shortUrl: req.params.id,
    //user: users.user
    user: req.session["user_id"]
  };
  res.render("urls_show", templateVars);
});


// Endpoint Edit URL form
app.get("/u/:id", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  }
  let templateVars = {
    longUrl: urlDatabase[req.params.id],
    shortUrl: req.params.id,
    //user: users.user
    user: req.session["user_id"]
  };
  res.render("urls_show", templateVars);
});

// logs the request body and gives a response parsed into a JS object
app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  const longUrl = req.body.longUrl;
  const userId = req.session["user_id"];
  addNewURL(shortUrl, longUrl, userId);
  res.redirect("/urls"); // redirect client to home home page
});

// Add a POST route that removes a URL resource from request: /urls/:id/delete
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls"); // redirect client to home page
});

// Add a POST route that update a URL resource: /urls/:id/update
app.post("/urls/:id/update", (req, res) => {
  // Update database with req.body, in the new field
  urlDatabase[req.params.id].longUrl = req.body.longUrl;
  res.redirect("/urls");
});

// Endpoint to handle a POST to /login
app.post("/login", (req, res) => {
  const userId = findUser(req.body.email);
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const compCryp = bcrypt.compareSync(req.body.password, hashedPassword);

  if (!userId) {
    res.status(403).send("Sorry, your Email is unknown, you have to register!");
  } else if (users[userId].password === req.body.password) {
    req.session["user_id"] = userId;
    res.redirect("/urls");
  } else {
    res.status(403).send("Email and password don't match!");
  }
});

// Implement the /logout endpoint so that it clears the user_id cookie and redirects /urls page
app.post("/logout", (req, res) => {
  req.session["user_id"] = null;
  res.redirect("/"); // redirect client to home page
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});