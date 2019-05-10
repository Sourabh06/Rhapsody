var express    = require("express"),
    router     = express.Router({mergeParams: true});
var Campground = require("../models/campground"),
    Comment    = require("../models/comment"),
    User       = require("../models/user"),
    middleware = require("../middleware");


//USER PROFILE SHOW
router.get("/", async function(req, res) {
    try {
        let user = await User.findById(req.params.id, function(err, foundUser) {
            if(err) {
                req.flash("error", "Something went wrong.");
                res.redirect("/");
            }
            Campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds){
                if(err) {
                    req.flash("error", "Something went wrong.");
                    return res.redirect("/");
                }  
                res.render("users/show", {user: foundUser, campgrounds: campgrounds});
            });
        }).populate('followers').exec();
    } catch (err){
        req.flash('error', err.message);
        return res.redirect('back');
    }
});



//EDIT
router.get("/edit", function(req, res){                 //middleware.checkCampgroundOwnership,
    User.findById(req.params.id, function(err, foundUser){
        if(err) {
            req.flash("error", "Something went wrong.");
            res.redirect("/");
        }
        Campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds){
            if(err) {
                req.flash("error", "Something went wrong.");
                return res.redirect("/");
            }  
            res.render("users/edit", {user: foundUser, campgrounds: campgrounds});
        });
    });
});


//UPDATE
router.put("/", middleware.checkCampgroundOwnership, function(req, res){
    //find and update  findByIdAndUpdate findOneandUpdate
    // User.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedUser){
    User.findByIdAndUpdate(req.params.id, function(err, updatedUser){
        if(err){
            res.redirect("/");
        } else {
            req.flash("success", "User edited");
            res.redirect("/users/" + req.params.id);
        }
    });
});


//DELETE
router.delete("/", middleware.checkCampgroundOwnership, function(req, res){
    User.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/");
        } else {
            req.flash("success", "User deleted");
            res.redirect("/");
        }
    });
});


module.exports = router;