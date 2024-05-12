// Question Document Schema
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var questionsSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  tags: [{
    type:Schema.Types.ObjectId ,
    ref: 'Tag',
    required: true,
  }],
  asked_by: {
    type: Schema.Types.ObjectId,
    ref: "User"
    // required: true,
  },
  ask_date_time: {
    type: Date,
    default:Date.now(),
    // required: true,
  },
  answers:[ {
    type: Schema.Types.ObjectId,
    ref: "Answer"
  }],
  views: {
    type: Number,
    default: 0,
    // required: true,
  },
  votes:{
    type: Number,
    default: 0,
  }
});

questionsSchema.virtual('url')
.get(function () {
  return '/posts/question/' + this._id;
});

module.exports = mongoose.model("Question", questionsSchema);
