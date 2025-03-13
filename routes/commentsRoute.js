const router = require('express').Router();
const { createCommentCtrl, getAllCommentCtrl, deleteCommentCtrl, updateCommentCtrl } = require('../controllers/commentsController');
const { verifyToken, verifyTokenAdmin } = require('../middlewares/verifyToken');
const validateId = require('../middlewares/validateId');


// /api/comments
router.route('/')
      .post(verifyToken, createCommentCtrl)
      .get(verifyTokenAdmin, getAllCommentCtrl)


// /api/comments
router.route('/:id')
      .delete(validateId, verifyToken, deleteCommentCtrl)
      .put(validateId, verifyToken, updateCommentCtrl);


module.exports = router;