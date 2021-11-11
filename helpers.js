//Helper Functions//

//Returns the URLs where the userID is equal to the ID of the currently logged-in user.
const urlsForUser = function(id, urlDatabase) {
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
const getUserByEmail = function(email, userDatabase) {
  for (const user in userDatabase) {
    if (userDatabase[user]["email"] === email) {
      return user;
    }
  } return false;
};


module.exports = {urlsForUser, generateRandomString, getUserByEmail}