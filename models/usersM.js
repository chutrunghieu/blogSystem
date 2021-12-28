var mongoose = require("mongoose");


const usersSchema = new mongoose.Schema({
  full_name: String,
  account_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
  },
  bookmarks_id: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bookmarks",
    },
  ],
  age: Number,
  phone_number: {
    type: Number,
    length: 10
  },
  sex:{
    type: String,
        enum: ["Male", "Female"],
        default: "Male",
  },
  email: String,
  address: String,
  dob: Date,
  avatar: String,
});

const users = mongoose.model("users", usersSchema);

module.exports = users;
