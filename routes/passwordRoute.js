const router = require('express').Router();
const { sendRessetPasswordLinkCtrl,
        getRessetPasswordLinkCtrl,
        ressetPasswordCtrl
      }   = require('../controllers/passwordController')



//Sent reset Password link
router.post('/', sendRessetPasswordLinkCtrl);

//Get reset password Link
router.get('/:userId/token', getRessetPasswordLinkCtrl);

//Set New Password
router.post('/:userId/:token', ressetPasswordCtrl);


module.exports = router;
