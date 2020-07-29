const User = require('./../models/user');

const deserializeUser = (req, res, next) => {
  const id = req.session.userId;

  User.findById(id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => {
      next(err);
    });
};

module.exports = deserializeUser;