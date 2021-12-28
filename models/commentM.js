var mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    content: {
        type: String
    },
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "article",
    },
    create_date: {
        type: Date,
        default: () => Date.now(),
    },
});

const comment = mongoose.model("comment", commentSchema);

module.exports = comment;

