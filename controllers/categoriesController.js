const asyncHandler = require('express-async-handler'),
      { Category, validateCategory } = require('../models/category')



/**--------------------------------------------
 * @desc Create New Category
 * @router /api/categories
 * @method POST
 * @access private (Only Admin)
 \**-------------------------------------------*/
 module.exports.createCategoryCtrl = asyncHandler(async (req, res) =>
 {
    const valid = validateCategory(req.body);
    if(valid.error)
    {
        res.status(400).json({ message: valid.error.details[0].message });
    }

    const category = await Category.create(
        {
            title: req.body.title,
            user: req.user.id
        }
    );

    res.status(201).json(category);
});



/**--------------------------------------------
 * @desc Get All Categories
 * @router /api/categories
 * @method GET
 * @access public
 \**-------------------------------------------*/
 module.exports.getAllCategoriesCtrl = asyncHandler(async (req, res) =>
 {
    const categories = await Category.find();
    res.status(200).json(categories);
});



/**--------------------------------------------
 * @desc Delete Category
 * @router /api/categories/:id
 * @method DELETE
 * @access private (Only Admin)
 \**-------------------------------------------*/
 module.exports.deleteCategoryCtrl = asyncHandler(async (req, res) =>
 {
    const category = await Category.findById(req.params.id);
    if(!category)
    {
        res.status(400).json({ message: 'Category not found' });
    }
    
    await Category.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Category deleted successfully !', categoryId: category._id, });
});