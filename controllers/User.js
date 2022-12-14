const User = require("./../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

module.exports = {
  create,
  login,
  checkToken,
  edit,
};

function checkToken(req, res) {
  console.log("req.user", req.exp);
  res.json(req.exp);
}

async function login(req, res) {
  try {
    //find user
    const user = await User.findOne({ username: req.body.username });
    if (!user) throw new Error();
    //checking if password matches
    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) throw new Error();
    res.json(createJWT(user));
  } catch {
    res.status(400).json("Bad Credentials");
  }
}

async function create(req, res) {
  try {
    //add user to the database
    const user = await User.create(req.body);
    // token will be a string
    const token = createJWT(user);
    // send back the token as a string
    // which we need to account for
    // in the client
    res.json(token);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
}

function edit(req, res) {
  const filter = { "User._id": req.params.id };
  const update = function (user) {
    user.name = req.body.name;
    user.email = req.body.email;
    user.username = req.body.username;
    user.save(() => {
      res.json(user);
    });
  };
  User.findOneAndUpdate(filter, update, { new: true });
}
/*-- Helper Functions --*/

function createJWT(user) {
  return jwt.sign(
    // data payload
    { user },
    process.env.SECRET,
    { expiresIn: "24h" }
  );
}
