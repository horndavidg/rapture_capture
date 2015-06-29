var mongoose = require("mongoose");
mongoose.connect(process.env.MONGOLAB_URI || "mongodb://localhost/rapture_capture_app");

mongoose.set("debug", true);

module.exports.Place = require("./place");
module.exports.Entry = require("./entry");
module.exports.User = require("./user");