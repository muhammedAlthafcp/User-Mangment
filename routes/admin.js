var express = require("express");
var router = express.Router();
var session = require("express-session");
var Comeon = require("../Models/mongodb");
var products = require("../Models/products");

const auth = function (req, res, next) {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect("/");
    }
};

// Admin route
router.get('/', auth, async function (req, res) {
    try {
            const users = await Comeon.find({});
            res.render("admin", { users });
        }
    catch (error) {
        console.log(error);
        // res.redirect("/");
    }
});

//for deleting

router.get("/delete/:id", async (req, res) => {
    const userId = req.params.id;
    const deletedUser = await Comeon.deleteOne({ _id: userId });
    if (deletedUser) {
        res.redirect("/admin");
    } else {
        res.render("login");
    }
});

//for editing
router.get("/edit/:id",  async (req, res) => {
    console.log(req.params.id);
    const userId = req.params.id;
    const user = await Comeon.findOne({ _id: userId });
    res.render("edit-user", { data: user });
});

router.post("/edit/:id", async (req, res) => {
    const id = req.params.id;
    const password=req.body.password;
    const name = req.body.name;
    const email = req.body.email;
    const gender = req.body.gender;
    const UpdatedUser = await Comeon.updateOne({ _id: id },req.body);
    if (UpdatedUser) {
        res.redirect("/admin");
    }
});
router.get("/add-user", async (req, res) => {
    res.render("add-user");
});

router.post("/add-user", async (req, res) => {
    

    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const gender = req.body.gender;
        const existEmail = await Comeon.findOne({ email: email });
        console.log(req.body);
        console.log(email);
        if(existEmail !=null){
            res.render('add-user',{errorMessage:'user already exists'})
        }
        else{
            await Comeon.create({ name, email, password, gender });
            res.redirect('/admin');
        }
        
      } catch (error) {
        console.log(error);
        res.render("", { invalid: "invalid" });
      }
    });


//for searching
router.post("/search", async (req, res) => {
    const word = req.body.keyword;
    const user = await Comeon.find({ name: { $regex: `^${word}`, $options: 'i' } });
    res.render("admin", { users: user });
});

router.get("/search",  (req, res) => {
    res.redirect("/");
});
                
module.exports = router;
