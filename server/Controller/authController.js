const bcrypt = require("bcryptjs");

module.exports = {
  register: (req, res, next) => {
    const db = req.app.get("db");
    const { email, password } = req.body;
    db.check_user_exists(email).then(user => {
      if (user.length) {
        res.status(200).send("email already exist in database");
      } else {
        const saltRounds = 12;
        bcrypt.genSalt(saltRounds).then(salt => {
          bcrypt.hash(password, salt).then(hashedPassword => {
            db.create_user([email, hashedPassword]).then(createdUser => {
              req.session.user = {
                id: createdUser[0].id,
                email: createdUser[0].email
              };
              res.status(200).send(req.session.user);
            });
          });
        });
      }
    });
  },
  login: (req, res, next) => {
    const db = req.app.get("db");
    const { email, password } = req.body;

    db.check_user_exists(email).then(user => {
      if (!user[0]) {
        res.status(200).send("incorrect email/password");
      } else {
        bcrypt.compare(password, user[0].user_password).then(result => {
          if (result) {
            req.session.user = {
              id: user[0].id,
              email: user[0].email
            };
            res.status(200).send(req.session.user);
          } else {
            res.status(200).send("incorrect email/password");
          }
        });
      }
    });
  }
};
