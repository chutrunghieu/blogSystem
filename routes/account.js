var express = require('express');
var router = express.Router();
var auth = require("../controllers/accountC");

router.get('/loginPage', auth.getLogin);
router.get('/signupPage', auth.getSignUp);

router.post("/login", auth.Login);
router.post("/signup", auth.signUp)

router.get("/logout", auth.Logout);


module.exports = router;
