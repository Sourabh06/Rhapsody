var express        = require("express"),
    app            = express(),
    bodyParser     = require("body-parser"),
    mongoose       = require("mongoose"),
    flash          = require("connect-flash"),
    passport       = require("passport"),
    LocalStrategy  = require("passport-local"),
    methodOverride = require("method-override"),
    Campground     = require("./models/campground"),
    Comment        = require("./models/comment"),
    User           = require("./models/user"),
    seedDB         = require("./seeds");

//requiring routes
var commentRoutes = require("./routes/comments"),
reviewRoutes      = require("./routes/reviews"),
campgroundRoutes  = require("./routes/campgrounds"), 
userRoutes        = require("./routes/users"),
indexRoutes       = require("./routes/index");

//to remove deprecation warning
mongoose.set('useFindAndModify', false);

// mongoose.set('useNewUrlParser', true);
// mongoose.set('useCreateIndex', true);

var url = process.env.DATABASEURL || "mongodb://localhost:27017/rhapsody";
mongoose.connect(url, {useNewUrlParser: true});

// mongoose.connect("mongodb://localhost:27017/yelp_camp", {useNewUrlParser: true});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB();    //seed the database

//moment
app.locals.moment = require('moment');

//PASSPORT CONFIG
app.use(require("express-session")({
    secret: "I am the Best!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(async function(req, res, next){
    res.locals.currentUser = req.user;
    if(req.user) {
     try {
       let user = await User.findById(req.user._id).populate('notifications', null, { isRead: false }).exec();
       res.locals.notifications = user.notifications.reverse();
     } catch(err) {
       console.log(err.message);
     }
    }
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
 });
 

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/users/:id", userRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);


app.listen(3000,process.env.IP, function(){
    console.log("Rhapsody has started!");
})
