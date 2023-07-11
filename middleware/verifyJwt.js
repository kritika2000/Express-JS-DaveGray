const jwt = require("jsonwebtoken");
require("dotenv").config();

// The user/jwt is verified when the user tries to get employees.
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  // if we do not have an auth header or if there is then if it doesn't starts with 'Bearer'
  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);
  console.log(authHeader); //Bearer token.
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403); // Invalid Token
    req.user = decoded.UserInfo.username;
    /* During verification/authentication we put the roles of the user
     defined in DB in req object so that it can be access by 
     next middleware verifyRoles.*/
    req.roles = decoded.UserInfo.roles;
    next();
  });
};

module.exports = verifyJWT;
