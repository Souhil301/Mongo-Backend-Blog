const { getAllUsersCtrl, 
      getUserCtrl, 
      UpdateUserProfileCtrl, 
      getUsersCountCtrl, 
      profilePhotoUploadCtrl, 
      deleteUserProfileCtrl} = require('../controllers/usersController'),
      { verifyToken, verifyTokenAdmin, verifyTokenOnlyUser, verifyTokenAndAuthorization }     = require('../middlewares/verifyToken'),
      validateId = require('../middlewares/validateId');
const photoUpload = require('../middlewares/photoUpload');


      const router = require('express').Router();


// Get api/users/profile
router.get('/profile', verifyTokenAdmin, getAllUsersCtrl);


// Get api/users/profile/:id
router.route('/profile/:id')
      .get( validateId, getUserCtrl)
      .put( validateId, verifyTokenOnlyUser, UpdateUserProfileCtrl)
      .delete( validateId, verifyTokenAndAuthorization, deleteUserProfileCtrl)


// Post api/users/profile/profile-photo-upload
router.route('/profile/profile-photo-upload')
.post(verifyToken, photoUpload.single('image'), profilePhotoUploadCtrl);


// Get api/users/count
router.get('/count', verifyTokenAdmin, getUsersCountCtrl);

module.exports = router