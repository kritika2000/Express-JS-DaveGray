/*
const usersDB = {
  // 1. Remove json usersDB as we have mongo DB to store this data.
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};
*/
const User = require("../model/Users");
/*
// 2. Removing these modules as we're not writing to files to anymore.
const fsPromises = require("fs").promises;
const path = require("path");
*/
const bcrypt = require("bcrypt");

/** This creates a new user in the database. */

const handleNewUser = async (req, res) => {
  const { user, pwd } = req.body;
  console.log(user, pwd);
  if (!user || !pwd) {
    return res
      .status(400)
      .json({ message: "Username and Password are required" });
  }
  /*
  // 3. check for duplicate user names inside static DB.
  const duplicate = usersDB.users.find((person) => person.username == user);
  */
  const duplicate = await User.findOne({ username: user }).exec(); // exec needs to be put when using async/await pattern as it doesn't require any callbacks for success/failure.
  if (duplicate) return res.sendStatus(409); //Conflict
  try {
    //encrypt password.
    const hashedpwd = await bcrypt.hash(pwd, 10);
    //store the new user with username and the encrypted password.
    // We will add a user role only to the new user while registeration.
    /* Removing this as we are not adding the new user to the file/static DB
    const newUser = {
      username: user,
      roles: {
        User: 2001,
      },
      password: hashedpwd,
    };
    usersDB.setUsers([...usersDB.users, newUser]);
    // writing the new user to the database/files for now.
    await fsPromises.writeFile(
      path.join(__dirname, "..", "model", "users.json"),
      JSON.stringify(usersDB.users)
    );
    console.log(usersDB.users);
    */
    // create a new user and store(new User() -> await newUser.save()) it at once in mongoDB.
    const result = await User.create({
      username: user,
      password: hashedpwd,
    });
    console.log(result); // returns the user/record create in the DB.
    res.status(201).json({ success: `New user ${user} created!` });
  } catch {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleNewUser };
