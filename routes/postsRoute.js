
const { verifyToken } = require('../middlewares/verifyToken')
const { createPostCtrl, 
      getAllPostsCtrl, 
      getSinglePostsCtrl, 
      getPostsCountCtrl, 
      deletePostsCtrl, 
      updatePostsCtrl, 
      updateImagePostsCtrl, 
      toggleLikeCtrl } = require('../controllers/postsController');

const photoUpload  = require('../middlewares/photoUpload');
const router = require('express').Router();
const validateId = require('../middlewares/validateId');


// /api/posts
router.route('/')
      .get(getAllPostsCtrl)
      .post(verifyToken, photoUpload.single('image'), createPostCtrl);


// /api/posts/count
router.get('/count', getPostsCountCtrl)


// /api/posts/:id
router.route('/:id')
      .get(validateId, getSinglePostsCtrl)
      .delete(validateId, verifyToken, deletePostsCtrl)
      .put(validateId, verifyToken, updatePostsCtrl)


// /api/posts/update-image/:id
router.route('/update-image/:id')
      .put(validateId, verifyToken, photoUpload.single('image'), updateImagePostsCtrl);



// /api/posts/like/:id
router.put('/like/:id', validateId, verifyToken, toggleLikeCtrl)




module.exports = router