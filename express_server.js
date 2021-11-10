const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Generates random shortURL and User ID
const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

//Checks to see if the email submitted in registration already exists => error//
const emailAlreadyExists = function(email) {
  for (const user in users) {
    if (users[user]["email"] === email) {
      return users[user].id;
    }
  } return false;
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }
};

//Middleware//

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());

//Get Requests//

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: users[req.cookies["user_id"]]
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

// Redirect after form submission
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

// redirect short URLs to long URLs
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_login", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World<b/></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});
 
app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

//Post Requests//

// Add shortURL - longURL key-value pair to urlDatabase object
app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.status(401).send("Error 401: You must be logged in to create a new URL");
  } else {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect(`/urls/${shortURL}`);
  }
});

// Deletes a shortURL - longURL key-value pair from urlDatabase and redirects to "/urls" page
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// POST route to update a URL resource
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect('/urls');
});

// // POST route to login with username
// app.post("/login", (req, res) => {
//   const username = req.body.username;
//   res.cookie("username", username);
//   res.redirect('/urls');
// });

//POST route to logout and delete userID cookies
app.post("/logout", (req, res) => {
  const userID = req.body.userID;
  res.clearCookie("user_id", userID);
  res.redirect('/urls');
});

app.post("/register", (req, res) => {

  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send("Error 400: Please include both a valid email and password!");
  } else if (emailAlreadyExists(email)) {
    res.status(400).send("Error 400: An account already exists with this email address!");
  } else {
    users[userID] = {
      id: userID,
      email: email,
      password: password
    };
  }
  res.cookie("user_id", userID);
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!emailAlreadyExists(email)) {
    res.status(403).send("Error 403: There is no user account associated with this email address!");
  } else {
    const userID = emailAlreadyExists(email);
    if (users[userID].password !== password) {
      res.status(403).send("Error 403: The password entered does not match our records for this email address!");
    } else {
      res.cookie('user_id', userID);
      res.redirect("/urls");
    }
  }
});


//Listening to Port//


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});