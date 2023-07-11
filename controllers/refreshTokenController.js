/*
const usersDB = {
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};
*/
const User = require("../model/Users");
const jwt = require("jsonwebtoken");

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  console.log(cookies);
  if (!cookies?.jwt) {
    // if(!(cookies && cookies.jwt))
    // Checking if we have cookies and a jwt inside cookies.
    return res.sendStatus(401);
  }
  const refreshToken = cookies.jwt;
  /*
  const foundUser = usersDB.users.find(
    (person) => person.refreshToken == refreshToken
  );
  */
  // Finding user from the DB
  const foundUser = await User.findOne({ refreshToken }).exec();
  console.log(foundUser);
  //   If no user has the refresh token.
  if (!foundUser) return res.sendStatus(403); //Forbidden.

  // verify if the token is correct.
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    console.log(decoded);
    if (err || foundUser.username !== decoded.username)
      return res.sendStatus(403);
    /*
      const accessToken = jwt.sign(
      { username: decoded.username }, // we do not pass password in the payload, as token are at risk of XSS, CSRF.
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );
    */
    // We'll add the user roles in the payload while creating the tokens.
    const roles = Object.values(foundUser.roles);
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: decoded.username,
          roles: roles,
        },
      }, // we do not pass password in the payload, as token are at risk of XSS, CSRF.
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );
    console.log(accessToken);
    res.json({ accessToken });
  });
};

module.exports = { handleRefreshToken };
