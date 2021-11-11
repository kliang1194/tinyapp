const { assert } = require('chai');
const {generateRandomString, getUserByEmail } = require("../helpers.js");

const testUsers = {
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


describe('generateRandomString', function() {

  it('should return a random string with six characters', function() {
    const randomStringLength = generateRandomString().length;
    const expectedLength = 6;
    assert.equal(randomStringLength, expectedLength);
  });

});


describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });

  it('should return undefined when no user exists for an invalid email', function() {
    const user = getUserByEmail("hello@kyle.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});
