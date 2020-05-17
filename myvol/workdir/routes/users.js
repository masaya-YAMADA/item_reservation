const express = require('express');
const router = express.Router();
const isAuthenticated = require('./isAuthenticated');
const loader = require('../models/sequelize-loader');
const Sequelize = loader.Sequelize;
const Op = Sequelize.Op;
const Reservation = require('../models/reservation');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

/* GET home page. */
router.get('/:userId', isAuthenticated, csrfProtection, function (req, res, next) {
  // req.params.userIdとログインしている人が同一か判定
  console.log('req.user=' + JSON.stringify(req.user));
  if (parseInt(req.params.userId) !== req.user.id) {
    const err = new Error('予期しないアクセスです');
    err.status = 400;
    next(err);
  }

  const nowTime = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
  const convNow = ('0000' + nowTime.getFullYear()).slice(-4) + '-' + ('00' + nowTime.getMonth()).slice(-2) + '-' + ('00' + nowTime.getDate()).slice(-2) + ' ' + ('00' + nowTime.getHours()).slice(-2) + ':' + ('00' + nowTime.getMinutes()).slice(-2) + ':' + ('00' + nowTime.getSeconds()).slice(-2);
  Reservation.findAll({
    where: {
      [Op.and]: [
        {
          reservedBy: req.params.userId

        },
        {
          startTime: {
            [Op.gte]: convNow
          }
        },
        {
          valid: 1
        }
      ]
    },
    order: [['startTime', 'ASC']]
  }).then((reservations) => {
    console.log('users.js::' + JSON.stringify(reservations));
    res.render('userReservation', { user: req.user, reservations, csrfToken: req.csrfToken() });
    // res.redirect('/');
  });

});

module.exports = router;
