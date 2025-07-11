const express = require('express');
const router = express.Router({mergeParams:true});
const User = require("../models/user.js")
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require('passport');
const { savedRedirectUrl } = require('../middleware.js');
const userController = require("../controllers/user.js");


router
    .route("/signup")
    .get( userController.rendersignup)
    .post(wrapAsync( userController.signup));


router
    .route("/login")
    .get( userController.renderlogin)
    .post( savedRedirectUrl,
           passport.authenticate("local",{failureRedirect:"/login" , 
           failureFlash:true}) ,
           userController.login);

router
    .route("/logout")
    .get(userController.logout);

module.exports = router;
