/*
const usersDB = {
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};
*/

// This is where where we give access token to the user if he logs in.

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
const Users = require("../model/Users");

/*
const fsPromises = require("fs").promises;
const path = require("path");
*/
const User = require("../model/Users");

const handleLogin = async (req, res) => {
  const { user, pwd } = req.body;
  if (!user || !pwd) {
    return res
      .status(400)
      .json({ message: "Username and Password are required" });
  }
  /*
  const foundUser = usersDB.users.find((person) => person.username == user);
  */
  const foundUser = await Users.findOne({ username: user }).exec();
  if (!foundUser) return res.sendStatus(401); //UnAuthorized.

  // evaluate password or authorizing the user.
  const match = await bcrypt.compare(pwd, foundUser.password);
  if (match) {
    // This is where we create signed JWT
    // We'll add the user roles in the payload while creating the tokens.
    const roles = Object.values(foundUser.roles);
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles: roles,
        },
      }, // we do not pass password in the payload, as token are at risk of XSS, CSRF.
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );
    const refreshToken = jwt.sign(
      { username: foundUser.username }, // no need to pass roles inside access token
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    /* We want to save the refresh tokens in the database, which allows us to create a logout 
    route that allow us to invalidate the refresh token when the user logs out.*/
    /*
    const otherUsers = usersDB.users.filter(
      (person) => person.username !== foundUser.username
    );
    // Saving refresh token with the current user who has logged in.
    const currentUser = { ...foundUser, refreshToken };
    usersDB.setUsers([...otherUsers, currentUser]);
    await fsPromises.writeFile(
      path.join(__dirname, "..", "model", "users.json"),
      JSON.stringify(usersDB.users)
    );
    */
    foundUser.refreshToken = refreshToken;
    const result = await foundUser.save(); // foundUser is the document we get and we can save it directly.
    console.log(result);
    // We set the refresh-token as httpcookie only so that it is not available to JS but still not 100% secure.
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, //persistent cookie.
    });
    res.json({ accessToken }); // The front-end dev decides where it should be stored. Best way to store in memory.
    // res.json({ success: `user ${user} is logged in` });
  } else res.sendStatus(401);
};

module.exports = { handleLogin };
