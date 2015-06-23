var mongoose = require('mongoose');
var Place = require("./place");
var User = require("./user");


var entrySchema = new mongoose.Schema ({
                        name: {
                          type: String, 
                          required: true
                        },
                        date: Date,
                        image: [String],
                        ownerId: String,
                        // Used for editing and deleting entries
                        body: {
                          type: String, 
                          required: true
                        },
                        place: {
                          type: mongoose.Schema.Types.ObjectId,
                          ref: "Place"
                        },
                        // This allows me to populate place data
                        // as needed
                        author: {
                        	type: mongoose.Schema.Types.ObjectId,
                        	ref: "User"
                        }
                         // This allows me to populate author data
                         // as needed
                      });

var Entry = mongoose.model("Entry", entrySchema);

module.exports = Entry;