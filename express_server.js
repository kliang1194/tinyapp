const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const morgan = require("morgan");

app.set("view engine", "ejs");

//Objects//

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userID"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "userID"}
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }
};

//Helper Functions//

//Returns the URLs where the userID is equal to the ID of the currently logged-in user.
const urlsForUser = function(id) {
  const userUrls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};

//Generates random shortURLs and UserIDs
const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

//Checks to see if the email submitted in registration already exists//
const emailAlreadyExists = function(email) {
  for (const user in users) {
    if (users[user]["email"] === email) {
      return users[user].id;
    }
  } return false;
};

//Middleware//

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['KYLE'],
  maxAge: 24 * 60 * 60 * 1000,
}));

app.use(morgan('dev'));

//Get Requests//

//Create New --> directs to login if not logged in. 
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  }
});

//Redirect after creating a new URL pairing. 
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id],
    urlUserID: urlDatabase[req.params.shortURL].userID,
  };
  res.render("urls_show", templateVars);
});

//Reads the main page 
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session.user_id),
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

// Redirect to long URL when clicking on short URL
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (longURL === undefined) {
      res.status(404).send("Error 404: This long URL cannot be found at this time!");
    } else {
      res.redirect(longURL);
    }
  } else {
    res.status(404).send("Error 404: This short URL does not currently correspond with a long URL!");
  }
});

//Reads registration page
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_registration", templateVars);
});

//Reads login page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_login", templateVars);
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

//Removed practice code//

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World<b/></body></html>\n");
// });

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });
 
// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });

//Post Requests//

// Add shortURL - longURL key-value pair to urlDatabase object
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status(401).send("Error 401: You must be logged in to create a new URL");
  } else {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect(`/urls/${shortURL}`);
  }
});

// Deletes a shortURL - longURL key-value pair from urlDatabase and redirects to "/urls" page
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const userURLs = urlsForUser(userID);
  if (Object.keys(userURLs).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.status(401).send("Error 401: This short URL does not belong to you. Therefore, you cannot delete this short URL!");
  }
});

// Edits a shortURL - longURL key-value pair
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID);
  if (Object.keys(userUrls).includes(req.params.id)) {
    const shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect('/urls');
  } else {
    res.send(401).send("Error 401: This short URL does not belong to you. Therefore, you cannot edit this short URL!");
  }
});

//Logout and delete userID cookies
app.post("/logout", (req, res) => {
  const userID = req.body.userID;
  req.session = null;
  res.redirect('/urls');
});

//Registers user
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
      password: bcrypt.hashSync(password, 10),
    };
  }
  req.session.user_id = userID;
  res.redirect('/urls');
});

//Login user
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = emailAlreadyExists(email);

  if (!emailAlreadyExists(email)) {
    res.status(403).send("Error 403: There is no user account associated with this email address!");
  } else {
    if (!bcrypt.compareSync(password, users[userID].password)) {
      res.status(403).send("Error 403: The password entered does not match our records for this email address!");
    } else {
      req.session.user_id = userID;
      res.redirect("/urls");
    }
  }
});

//Listening to Port//

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});