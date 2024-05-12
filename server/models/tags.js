// Tag Document Schema
// Answer Document Schema
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var tagsSchema = new Schema({
  name: {
    type: String,
  },
});

tagsSchema.virtual('url')
.get(function () {
  return '/posts/tag/' + this._id;
});


module.exports = mongoose.model("Tag", tagsSchema);
