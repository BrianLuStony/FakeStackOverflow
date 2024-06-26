// Answer Document Schema
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const answersSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  ans_by: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  ans_date_time: {
    type: Date,
    default:Date.now(),
    // required: true,
  },
  votes: {
    type: Number,
    default: 0,
  },
});

answersSchema.virtual("url").get(function () {
  return "/posts/answer/" + this._id;
});
module.exports = mongoose.model("Answer", answersSchema);
