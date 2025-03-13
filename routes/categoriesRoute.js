const router = require('express').Router();
const { createCategoryCtrl, getAllCategoriesCtrl, deleteCategoryCtrl } = require('../controllers/categoriesController');
const { verifyTokenAdmin } = require('../middlewares/verifyToken');
const validateId = require('../middlewares/validateId');



// /api/categories
router.route('/')
      .post(verifyTokenAdmin, createCategoryCtrl)
      .get(getAllCategoriesCtrl);


// /api/categories/:id
router.route('/:id').delete(validateId, verifyTokenAdmin, deleteCategoryCtrl);

module.exports = router;