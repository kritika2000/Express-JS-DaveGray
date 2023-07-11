/*
const usersDB = {
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

const fsPromises = require("fs").promises;
const path = require("path");
*/
const User = require("../model/Users");
const handleLogout = async (req, res) => {
  // On client, also delete the access token.
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    // if(!(cookies && cookies.jwt))
    // Checking if we have cookies and a jwt inside cookies.
    return res.sendStatus(204); // No content.
  }
  const refreshToken = cookies.jwt;
  // If refresh token in the DB for a user.
  /*
  const foundUser = usersDB.users.find(
    (person) => person.refreshToken == refreshToken
  );
  */
  // Finding user from the DB
  const foundUser = await User.findOne({ refreshToken }).exec();
  //   If no user has the refresh token.
  if (!foundUser) {
    // Clear cookie on the client.
    res.clearCookie("jwt", { httpOnly: true });
    return res.sendStatus(403); //Forbidden.
  }
  /*
  const otherUsers = usersDB.users.filter(
    (person) => person.refreshToken !== foundUser.refreshToken
  );
  // Delete refreshToken in DB
 
  const currentUser = { ...foundUser, refreshToken: "" };
  usersDB.setUsers([...otherUsers, currentUser]);
  await fsPromises.writeFile(
    path.join(__dirname, "..", "model", "users.json"),
    JSON.stringify(usersDB.users)
  );
  */
  foundUser.refreshToken = "";
  const result = await foundUser.save(); // foundUser is the document we get and we can save it directly.
  console.log(result);
  res.clearCookie("jwt", { httpOnly: true }); // on prod we want to set secure:true also which only serves on http.
  res.sendStatus(204); // all well but no content to send.
};

module.exports = { handleLogout };
