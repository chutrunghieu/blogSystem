var account = require("../models/accountM");
var users = require("../models/usersM");
var bcrypt = require("bcrypt");

exports.signUp = async (req, res, next) => {
    const { usr, pwd, pwd2} = req.body;
    account.findOne({ username: usr }).exec(
        async (err, user) => {
            if (err) {
                return console.log(err);
            } else if (user) {
                const errorUsername = "Username has already exist !!!";
                return res.redirect(`/account/signupPage?msg=${errorUsername}`);
            } else if (pwd.length < 4) {
                const errorPassword = "Password must be at least 4 characters !!!";
                return res.redirect(`/account/signupPage?msg=${errorPassword}`);
            } else if (pwd2 != pwd) {
                const errorPassword = "Confirm Password Error!";
                return res.redirect(`/account/signupPage?msg=${errorPassword}`);
            } else {
                const newAccount = new account({
                    username: usr,
                    password: pwd,
                    role: "users",
                });
                await newAccount.save();
                const UserAccount = await account.findOne({username : usr});
                const newUser = new users({
                  account_id : UserAccount._id,
                })
                await newUser.save();

                return res.redirect("/account/loginPage");

            };
        });
};

exports.Login = (req, res, next) => {

  const { usr, pwd } = req.body;

  account.findOne({ username: usr }).exec((err, user) => {
    if (err) {
      console.log(err);
      return res.redirect("/account/loginPage");
    } else if (!user) {
      const msg = "User Not Found !";
      return res.redirect(`/account/loginPage?msg=${msg}`);
    } else {
      bcrypt.compare(pwd, user.password, (err, same) => {
        if (same) {
          req.session.userId = user._id;
          req.session.isAdmin = user.role === "admin" ? true : false;
          req.session.isUsers = user.role === "users" ? true : false;

          if (user.role === "admin") {
            return res.redirect(`/admin/admin_home`);
          } else {
            return res.redirect(`/users/users_home`);
          }
        } else {
          const msg = "Username or Password is incorrect !";
          return res.redirect(`/account/loginPage?msg=${msg}`);
        }
      });
    }
  });
};

exports.Logout = (req, res, next) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      } else {
        return res.redirect("/");
      }
    });
  }
};

exports.getLogin = (req, res, next) => {
    const { msg } = req.query;
    res.render("login", { err: msg, title: "Login to your Account"
})
};


exports.getSignUp = (req, res, next) => {
  const { msg } = req.query;
    res.render("signup",{ err: msg});
};

