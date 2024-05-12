
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const commentsSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  votes:{
    type:Number,
    default:0
  },
  comment_by: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  comment_time: {
    type: Date,
    default:Date.now(),
    // required: true,
  },
});

commentsSchema.virtual("url").get(function () {
  return "/posts/comment/" + this._id;
});
module.exports = mongoose.model("Comment", commentsSchema);
