const isAdmin = (req, res, next) => {
    if (req.session && req.session.isAdmin === true && req.session.userId) {
      return next();
    } else {
      const msg =
        "You must be logged in with admin permission to view this page.";
      return res.redirect(`/account/loginPage?msg=${msg}`);
    }
};

const isUsers = (req, res, next) => {
    if (req.session && req.session.isUsers === true && req.session.userId) {
      return next();
    } else {
      const msg =
    "You must be logged in with user permission to view this page.";
    return res.redirect(`/account/loginPage?msg=${msg}`);
    }
};

module.exports = { isAdmin, isUsers};