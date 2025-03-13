const fs = require('fs'),
      path = require('path'),
      asyncHandler = require('express-async-handler'),
      { Post, validateCreatePost, validateUpdatePost } = require('../models/post'),
      { cloudinaryUploadImage, cloudinaryRemoveImage } = require('../utils/cloudinary'),
      { Comment } = require('../models/comment')



      
/**--------------------------------------------
 * @desc Create New Post
 * @router /api/posts
 * @method POST
 * @access private (Only logged in user)
 \**-------------------------------------------*/
module.exports.createPostCtrl = asyncHandler(async (req, res) =>
{
    // 1. Validation for image
    if(!req.file)
    {
        return res.status(400).json({ message: 'No image provided' });
    }
    
    // 2. Validation for data
    const valid = validateCreatePost(req.body)
    if(valid.error)
    {
        return res.status(400).json({ message: valid.error.details[0].message });
    }

    //Upload Photo
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath)

    //create new post and save it DB
    const post = await Post.create(
        {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            user: req.user.id,
            image:
            {
                url: result.secure_url,
                publicId: result.public_id,
            }
        }
    );

    //serd response
    res.status(200).json(post);

    //Remove image from the server 
    fs.unlinkSync(imagePath);
});



/**--------------------------------------------
 * @desc Get Posts
 * @router /api/posts
 * @method Get
 * @access public
 \**-------------------------------------------*/
module.exports.getAllPostsCtrl = asyncHandler(async (req, res) =>
{
    const POST_PRE_PAGE = 3;
    const { pageNumber, category } = req.query;
    let posts;

    if(pageNumber)
    {
        posts = await Post.find()
            .skip((pageNumber - 1) * POST_PRE_PAGE)
            .limit(POST_PRE_PAGE)
            .sort({ createdAt: -1 })
            .populate("user", ["-password"]);
    }
    else if(category)
    {
        posts = await Post.find({ category })
                          .sort({ createdAt: -1 })
                          .populate("user", ["-password"]);
    }
    else
    {
        posts = await Post.find()
                          .sort({ createdAt: -1 })
                          .populate("user", ["-password"]);
    }

    res.status(200).json(posts)
});



/**--------------------------------------------
 * @desc Get single post
 * @router /api/posts/:id
 * @method GET
 * @access public
 \**-------------------------------------------*/
 module.exports.getSinglePostsCtrl = asyncHandler(async (req, res) =>
 {
    const post = await Post.findById(req.params.id)
                           .populate("user", ["-password"])
                           .populate('comments');
    if(!post)
    {
        res.status(400).json({ message: 'Post not found' })
    }

    res.status(200).json(post)
});



/**--------------------------------------------
 * @desc Get posts count
 * @router /api/posts/count
 * @method GET
 * @access public
 \**-------------------------------------------*/
 module.exports.getPostsCountCtrl = asyncHandler(async (req, res) =>
 {
    const count = await Post.countDocuments();
    res.status(200).json(count)
});



/**--------------------------------------------
 * @desc Delete post
 * @router /api/posts/:id
 * @method DELETE
 * @access private (Only Admin or Owner of pest)
 \**-------------------------------------------*/
 module.exports.deletePostsCtrl = asyncHandler(async (req, res) =>
 {
    const post = await Post.findById(req.params.id);
    if(!post)
    {
        res.status(400).json({ message: 'Post not found' })
    }

    if(req.user.isAdmin || req.user.id === post.user.toString())
    {
        await Post.findByIdAndDelete(req.params.id);
        await cloudinaryRemoveImage(post.image.publicId);

        //Delete all comments that belong 
        await Comment.deleteMany({ postId: post._id })

        res.status(200).json({ message: 'Post has been deleted successfully',
                                postId: post._id })
    }
    else
    {
        res.status(403).json({ message: 'Access deneid' })
  
    }

    res.status(200).json(post)
});



/**--------------------------------------------
 * @desc Update post
 * @router /api/posts/:id
 * @method PUT
 * @access private (Only Owner of pest)
 \**-------------------------------------------*/
 module.exports.updatePostsCtrl = asyncHandler(async (req, res) =>
 {
    //Validation
    const valid = validateUpdatePost(req.body);
    if(valid.error)
    {
        return res.status(400).json({ message: valid.error.details[0].message });
    }

    //Get the post from DB and check if exist
    const  post = await Post.findById(req.params.id);
    if(!post)
    {
        return res.status(400).json({ message: 'post not found' })
    }

    //Check post belong 
    if(req.user.id !== post.user.toString())
    {
        return res.status(403).json({ message: 'access denied, you are not allowed ' })
    }

    //Update post
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, 
        {
            $set:
            {
                title: req.body.title,
                description: req.body.description,
                category: req.body.category
            }
        },
        {new: true}).populate('user', ["-password"]);

    //send response
    res.status(200).json(updatedPost);
});



/**--------------------------------------------
 * @desc Update image post
 * @router /api/posts/upload-image/:id
 * @method PUT
 * @access private (Only Owner of pest)
 \**-------------------------------------------*/
 module.exports.updateImagePostsCtrl = asyncHandler(async (req, res) =>
 {
    //Validation
    if(!req.file)
    {
        return res.status(400).json({ message: "No image provided" });
    }

    //Get the post from DB and check if exist
    const  post = await Post.findById(req.params.id);
    if(!post)
    {
        return res.status(400).json({ message: 'post not found' })
    }

    //Check post belong 
    if(req.user.id !== post.user.toString())
    {
        return res.status(403).json({ message: 'access denied, you are not allowed ' })
    }

    //delete the old image
    await cloudinaryRemoveImage(post.image.publicId);

    //Upload new photo
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`)
    const result = await cloudinaryUploadImage(imagePath);

    //Update the image in DB
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, 
        {
            $set:
            {
                image:
                {
                    url: result.secure_url,
                    publicId: result.public_id,
                }
            }
        },
        {new: true})

    //Send response
    res.status(200).json(updatedPost);

    //Rmove image 
    fs.unlinkSync(imagePath);

});



/**--------------------------------------------
 * @desc Toggle Like
 * @router /api/posts/like/:id
 * @method PUT
 * @access private (Only logged in user)
 \**-------------------------------------------*/
 module.exports.toggleLikeCtrl = asyncHandler(async (req, res) =>
 {
    const loggedInUser = req.user.id;
    const { id: postId } = req.params;

    let post = await Post.findById(postId);
    if(!post)
    {
        return res.status(400).json({ message: 'post not found' });
    }

    const isPostAlreadyLiked = post.likes.find((user) => user.toString() === loggedInUser);

    if(isPostAlreadyLiked)
    {
        post = await Post.findByIdAndUpdate(
            postId,
            {
                $pull: { likes: loggedInUser }
            },
            { new: true }
        );
    }
    else
    {
        post = await Post.findByIdAndUpdate(
            postId,
            {
                $push: { likes: loggedInUser }
            },
            { new: true }
        );
    }

    res.status(200).json(post);
 })