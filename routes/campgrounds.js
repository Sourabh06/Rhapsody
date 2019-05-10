var express = require("express"),
    router  = express.Router();
var Campground = require("../models/campground"),
Comment        = require("../models/comment"),
User           = require("../models/user"),
middleware     = require("../middleware"),
Review         = require("../models/review");
Notification   = require("../models/notification");



//INDEX
router.get("/", function(req, res){
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all campgrounds from DB
        Campground.find({track_name: regex}, function(err, allCampgrounds){
           if(err){
               console.log(err);
           } else {
              if(allCampgrounds.length < 1) {
                  noMatch = "No artists match that query, please try again.";
              }
              res.render("campgrounds/index", {campgrounds:allCampgrounds, noMatch: noMatch});
           }
        });
    } else {
        Campground.find({},function(err, allCampgrounds){
            if(err){
                console.log(err);
            } else {
                res.render("campgrounds/index", {campgrounds:allCampgrounds, noMatch: noMatch});
            }
        })
    }
});

//CREATE

router.post("/", middleware.isLoggedIn, async function(req, res){
    // get data from form and add to campgrounds array
    var track_name  = req.body.track_name;
    var artist_name    = req.body.artist_name;
    var image       = req.body.image;
    var album_name  = req.body.album_name;
    var video_link  = req.body.video_link;
    var released    = req.body.released;
    var genre       = req.body.genre;
    var description = req.body.description;
        
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {track_name: track_name, artist_name: artist_name, image: image, album_name: album_name, video_link: video_link, released: released, genre: genre, description: description, author:author}
try {
    let campground = await Campground.create(newCampground);
    let user = await User.findById(req.user._id).populate('followers').exec();
    let newNotification = {
      username: req.user.username,
      campgroundId: campground.id
    }
    for(const follower of user.followers) {
      let notification = await Notification.create(newNotification);
      follower.notifications.push(notification);
      follower.save();
    }

    //redirect back to campgrounds page
    res.redirect(`/campgrounds/${campground.id}`);
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});




//NEW
router.get("/new", middleware.isLoggedIn, function(req,res){
    res.render("campgrounds/new");
});

//SHOW
router.get("/:id", function(req, res){
    Campground.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function (err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else {
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//EDIT
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    }); 
});


//UPDATE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    delete req.body.campground.rating;
    //find and update  findByIdAndUpdate findOneandUpdate
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Music Info edited");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});


//DELETE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function (err, campground){
        if(err){
            res.redirect("/campgrounds");
        } else {
             // deletes all comments associated with the campground
             Comment.remove({"_id": {$in: campground.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/campgrounds");
                }
                // deletes all reviews associated with the campground
                Review.remove({"_id": {$in: campground.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/campgrounds");
                    }
                    //  delete the campground
                    campground.remove();
                req.flash("success", "Campground deleted");
                res.redirect("/campgrounds");
                });
            });
        }
    });
});


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;