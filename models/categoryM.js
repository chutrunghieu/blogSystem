var mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    description: String,
    create_date: {
        type: Date,
        default: () => Date.now(),
    },
    image: String
});

const category = mongoose.model("category", categorySchema);

module.exports = category;

