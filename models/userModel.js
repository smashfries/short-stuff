const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  passwordHash: String,
  proMember: Boolean,
  emailVerified: Boolean,
  tokens: [
    {
      token: String,
    },
  ],
});

const UserModel = mongoose.model("User", userSchema);

module.exports = {
  UserModel,
};
