const router = require('express').Router();
const { registerUserCtrl, loginUserCtrl, verifyEmailAccountCtrl } = require('../controllers/authController');

//register route
router.post('/register', registerUserCtrl);

//login route
router.post('/login', loginUserCtrl);

//verify email account route
router.get('/:userId/verify/:token', verifyEmailAccountCtrl);

module.exports = router;