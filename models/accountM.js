var mongoose = require("mongoose");
var bcrypt = require("bcrypt");

const accountSchema = new mongoose.Schema({
    username:{
        type: String,
        minlength: 4,
        maxlength: 100,
        required: true,
    },
    password: {
        type: String,
        minlength: 4,
        maxlength: 255,
        required: true,
      },
    role: {
        type: String,
        enum: ["admin", "users"],
        default: "users",
    },
});

accountSchema.path("password").set((inputString) => {
    return (inputString = bcrypt.hashSync(
      inputString,
      bcrypt.genSaltSync(10),
      null
    ));
});

const account = mongoose.model("account", accountSchema);

module.exports = account;