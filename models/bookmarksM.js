var mongoose = require("mongoose");


const bookmarksSchema = new mongoose.Schema({
    article_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "article",
    },
    users_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
},{timestamps:true}
);

const bookmarks = mongoose.model("bookmarks", bookmarksSchema);

module.exports = bookmarks;