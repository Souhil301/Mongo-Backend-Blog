const asyncHandler = require('express-async-handler');
const { Comment, validateCreateComment, validateUpdateComment } = require('../models/comment');
const { User } = require('../models/User');




/**--------------------------------------------
 * @desc Create New Comment
 * @router /api/comments
 * @method POST
 * @access private (Only logged in user)
 \**-------------------------------------------*/
 module.exports.createCommentCtrl = asyncHandler(async (req, res) =>
 {
    console.log("Request Body:", req.body);
    const valid = validateCreateComment(req.body);
    console.log("Validation Result:", valid);

    if(valid.error)
    {
        return res.status(400).json({ message: valid.error.details[0].message });
    }

    const profile = await User.findById(req.user.id);

    const comment = await Comment.create(
        {
            postId: req.body.postId,
            text:req.body.text,
            user: req.user.id,
            username: profile.username,
        }
    );

    res.status(201).json(comment);
});



/**--------------------------------------------
 * @desc Get All Comments
 * @router /api/comments
 * @method GET
 * @access private (Only admin)
 \**-------------------------------------------*/
 module.exports.getAllCommentCtrl = asyncHandler(async (req, res) =>
 {
    const comments  = await Comment.find().populate('user');
    res.status(200).json(comments);
 });



 /**--------------------------------------------
 * @desc Delete Comment
 * @router /api/comments/:id
 * @method DELETE
 * @access private (Only admin or owner)
 \**-------------------------------------------*/
 module.exports.deleteCommentCtrl = asyncHandler(async (req, res) =>
 {
    const comment = await Comment.findById(req.params.id);
    if(!comment)
    {
        return res.status(404).json({ message:'comment not found' });
    }

    if(req.user.isAdmin || req.user.id === comment.user.toString())
    {
        await Comment.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Comment deleted' });
    }
    else
    {
        res.status(403).json({ message: 'Access denied, not allowed' });
    }
 });




 /**--------------------------------------------
 * @desc Update Comment
 * @router /api/comments/:id
 * @method POST
 * @access private (Only owner)
 \**-------------------------------------------*/
 module.exports.updateCommentCtrl = asyncHandler(async (req, res) =>
 {
    const valid = validateUpdateComment(req.body);
    if(valid.error)
    {
        return res.status(400).json({ message: valid.error.details[0].message });
    }

    const comment = await Comment.findById(req.params.id);
    if(!comment)
    {
        return res.status(404).json({ message:'comment not found' }); 
    }

    if(req.user.id !== comment.user.toString())
    {
        return res.status(403).json({ message: 'access denied, Only User himself can edit' })
    }

    const updateComment = await Comment.findByIdAndUpdate(req.params.id,
        {
            $set:
            {
                text: req.body.text
            }
        },
        { new: true });

    res.status(200).json(updateComment);
});