const asyncHandler                                     = require('express-async-handler'),
      { User, validateUpdateUser }                     = require('../models/User'),
      bcrypt                                           = require('bcrypt'),
      path                                             = require('path'),
      { cloudinaryUploadImage, cloudinaryRemoveImage, cloudinaryRemoveMultipleImage } = require('../utils/cloudinary'),
      fs                                               = require('fs'),
      { Comment } = require('../models/comment'),
      { Post } = require('../models/post');

      


/**--------------------------------------------
 * @desc profile All  Users
 * @router /api/users/profile
 * @method GET
 * @access private (Only Admin)
 \**-------------------------------------------*/
 module.exports.getAllUsersCtrl = asyncHandler( async (req, res) =>
 {
    const users = await User.find().select('-password').populate('posts');
    return res.status(200).json(users)
 });



 /**--------------------------------------------
 * @desc profile  User
 * @router /api/users/profile/:id
 * @method GET
 * @access public
 \**-------------------------------------------*/
 module.exports.getUserCtrl = asyncHandler( async (req, res) =>
 {
    const user = await User.findById(req.params.id).select('-password').populate('posts');
    if(!user)
    {
        return res.status(404).json({ message: "user not found !"})
    }
    return res.status(200).json(user)
 });



  /**--------------------------------------------
 * @desc Update profile  User
 * @router /api/users/profile/:id
 * @method PUT
 * @access private (only user himself)
 \**-------------------------------------------*/
 module.exports.UpdateUserProfileCtrl = asyncHandler( async (req, res) =>
 {
    const valid = validateUpdateUser(req.body)
    if(valid.error)
    {
        return res.status(400).json({ message: valid.error.details[0].message});
    }

    if(req.body.password)
    {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt)
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, 
        {
            $set:
            {
                username: req.body.username,
                bio: req.body.bio,
                password: req.body.password
            }
        }, { new: true }).select('-password').populate("posts");
        
    res.status(200).json(updatedUser);
});


/**--------------------------------------------
 * @desc profile  Users
 * @router /api/users/profile
 * @method Get
 * @access private (Only Admin)
 \**-------------------------------------------*/
 module.exports.getUsersCountCtrl = asyncHandler( async (req, res) =>
 {
    const count = await User.countDocuments()
    return res.status(200).json(count)
 });


   /**--------------------------------------------
 * @desc Upload profile photo User
 * @router /api/users/profile/profile-photo-upload
 * @method POST
 * @access private (only user himself)
 \**-------------------------------------------*/
 module.exports.profilePhotoUploadCtrl = asyncHandler( async (req, res) =>
 {
    if(!req.file)
    {
        return res.status(400).json({ message: "No file provided!" })

    }

    //Get image path
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);

    //Upload to cloudinary
    const result = await cloudinaryUploadImage(imagePath);

    //Get user from DB
    const user = await User.findById(req.user.id);
    
    //Delete old Photo Profile
    if(user.profilePhoto.publicId !== null)
    {
        await cloudinaryRemoveImage(user.profilePhoto.publicId)
    }

    //Change profilePhoto in DB
    user.profilePhoto=
    {
        url: result.secure_url,
        publicId: result.public_id,
    }
    await user.save();

    //Send response
    res.status(200).json(
    { 
        message: `Hellow ${user.username}, Your profile photo uploaded Successfully!`,
        profilePhoto: { url: result.secure_url, publicId: result.public_id }
    });

    //remove P_P from imaages
    fs.unlinkSync(imagePath)
 });



/**--------------------------------------------
 * @desc delete User Account
 * @router /api/users/profile/:id
 * @method DELETE
 * @access private (Admin or user himself)
 \**-------------------------------------------*/
 module.exports.deleteUserProfileCtrl = asyncHandler( async (req, res) =>
 {
    // Get User from DB
    const user = await User.findById(req.params.id);
    if(!user)
    {
        return res.status(400).json({ message: 'User not found' })
    }

    // Get all posts from DB
    const posts = await Post.find({ user: user._id });

    // Get the public ids from the posts
    const publicIds = posts?.map((post) => post.image.publicId);

    // Delete all posts image from cloudinary that belong to this user
    if(publicIds?.length > 0)
    {
        await cloudinaryRemoveMultipleImage(publicIds);
    }

    // Delete the profile picture from cloudinary
    if(user.profilePhoto.publicId !== null) 
    {
        await cloudinaryRemoveImage(user.profilePhoto.publicId);
    }

    // Delete user posts & comments
    await Post.deleteMany({ user: user._id });
    await Comment.deleteMany({ user: user._id });

    // Delete user himself
    await User.findByIdAndDelete(req.params.id);

    // Send request
    return res.status(200).json({ message: "Profile Deleted !" })

 })