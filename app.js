var express      = require("express"),
app              = express(),
bodyParser       = require("body-parser"),
expressSanitizer = require("express-sanitizer"),
mongoose         = require("mongoose"),
methodOverride   = require("method-override");

var url = process.env.DATABASE_URL || "mongodb://localhost/restful_blog_app";

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer()); //always after bodyParser
app.use(methodOverride("_method"));

var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: { //created is of type date, and has a default value of current date
        type: Date, 
        default: Date.now()
    }
});

var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "Test Blog",
//     image: "https://p.bigstockphoto.com/GeFvQkBbSLaMdpKXF1Zv_bigstock-Aerial-View-Of-Blue-Lakes-And--227291596.jpg",
//     body: "Hello this is a blog post"
// });

//RESTful Routes

//root route directs to index route
app.get("/", function(req,res){
    res.redirect("/blogs");
});

//INDEX GET route
app.get("/blogs", function(req,res){
    Blog.find({},function(err, blogs){
        if(err){
            console.log(err);
        }else{
            res.render("index", { blogs: blogs});
        }
    });
});

//NEW ROUTE
app.get("/blogs/new", function(req,res){
    res.render("new");
});

//CREATE ROUTE
app.post("/blogs", function(req,res){
    
    //Code sanitization - removes any malicious script tags
    req.body.blog.body = req.sanitize(req.body.blog.body);
    
    //create blog
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.redirect("new");
        }else{
            //redirect
            res.redirect("/blogs");
        }
    });    
});

//SHOW ROUTE
app.get("/blogs/:id", function(req,res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
           res.redirect("/blogs");
        }else{
            res.render("show", {blog: foundBlog});
        }
    });
});

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req,res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.render("edit", {blog: foundBlog});
        }
    });
});

//UPDATE ROUTE
app.put("/blogs/:id", function(req,res){
    //Code sanitization - removes any malicious script tags
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs/"+req.params.id);
        }
    });
});

//DESTROY ROUTE
app.delete("/blogs/:id", function(req,res){
    //destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err){ //nothing to return in delete
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs");
        }
    });
});


var port = process.env.PORT || 3000;

app.listen(port, process.env.IP, function(){
    console.log("Blog server is running");
});