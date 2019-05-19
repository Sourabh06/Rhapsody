var mongoose = require("mongoose");
var Review = require("./review");


//SCHEMA
var campgroundSchema = new mongoose.Schema({
    track_name: String,
    artist_name: String,
    image: String,
    album_name: String,
    video_link: String,
    released: String,
    genre: String,
    description: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    createdAt: { 
        type: Date,
        default: Date.now
    },
    comments: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Comment"
        }
    ],
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    rating: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("Campground", campgroundSchema);
