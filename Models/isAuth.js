const isAuth = function (req, res, next) {
    if (req.session.loggedIn) {
      req.user = req.session.user;
      next(); // Proceed to the next middleware or route handler
    } else {
      res.render("login"); // If not authenticated, redirect to login page
    }
  };
  
  module.exports = isAuth;
  