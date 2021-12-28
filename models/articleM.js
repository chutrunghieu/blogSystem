var mongoose = require("mongoose");


const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    description: String,
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    write_date:{
        type: Date,
        default: () => Date.now(),
    } ,
    update_date:{
        type: Date,
        default: () => Date.now(),
    } ,
    content: String,
    image:{ 
        type: String
    },
    category_name:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
    },
    comment_id: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "comment",
        },
      ],
    status: {
        type: String,
        enum: ["draft", "pending", "publish"],
        default: "draft",
    },
    views:{
        type: Number,
        default:0,
    }
});
// articleSchema.plugin(mongoosePaginate);
const article = mongoose.model("article", articleSchema);

module.exports = article;

