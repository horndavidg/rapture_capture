var mongoose = require("mongoose");
var Entry = require("./entry");
var User = require("./user");
// var DateOnly = require('mongoose-dateonly')(mongoose);

var placeSchema = new mongoose.Schema({
                    name: String,
                    location: String,
                    lat: String,
                    long: String,
                    startdate: String,
                    enddate: String,
                    ownerId: String,
                    // Used for editing and deleting places
                    image: [String],
                    entries: [{
                      type: mongoose.Schema.Types.ObjectId,
                      ref: "Entry"
                    }],
                    // This allows me to populate entry data
                    // as needed
                    author: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                    },
                     // This allows me to populate author data
                    // as needed
                  });



placeSchema.pre('remove', function(next) {
    Entry.remove({post: this._id}).exec();
    next();
});

var Place = mongoose.model("Place", placeSchema);

module.exports = Place;