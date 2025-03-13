const asyncHandler                                      =   require('express-async-handler'),
      bcrypt                                            =   require('bcrypt'),
      { User, validateEmail, validateNewPassword  } =   require('../models/User'),
      VerificationToken                                 = require('../models/VerificationToken'),
      crypto                                            = require('crypto'),
      sendEmail                                         = require('../utils/sendEmail');

/**--------------------------------------------
 * @desc Send Reset Password Link to User
 * @router /api/password/reset-password/
 * @method POST
 * @access public
 \**-------------------------------------------*/
 module.exports.sendRessetPasswordLinkCtrl = asyncHandler(async (req, res) =>
{
    //1.Validation
    const email = req.body;
    const  valid  = validateEmail(email);
    if(valid.error)
    {
        return res.status(400).json({ message: valid.error.details[0].message});
    }
    
    //2.Get the user from DB by email
    const user = await User.findOne({ email: req.body.email });
    if(!user)
    {
        return res.status(404).json({ message: 'User with given email does not exist !' });
    }

    //3.Creating Verification Token 
    let verificationToken = await VerificationToken.findOne({ userId: user._id });
    if(!verificationToken)
    {
        verificationToken = new VerificationToken({
            userId : user._id,
            token : crypto.randomBytes(32).toString("hex"),
        });
        verificationToken.save();
    }
    

    //4.Creating link
    const link = `${process.env.CLIENT_DOMAIN}/reset-password/${user._id}/${verificationToken.token}`;
    
    //5.Creating HTML Template
    const htmlTemplate =`
    <h1>Hello from blog , you want to reset your password </h1>
    <a href="${link}">Click Here to reset your password </a>`
    
    //6.Sending Email
        try {
            await sendEmail(user.email, "Reset Your Password", htmlTemplate);
            console.log("Email sent successfully.");
        } catch (error) {
            console.error("Error sending email:", error);
            return res.status(500).json({ message: "Failed to send reset password." });
        }

    //7.Response To The Client
    return res.status(200).json({ message: 'Link to reset your password sent to you , Check Your Email !' }) 
})



/**--------------------------------------------
 * @desc Get Reset Password Link
 * @router /api/password/reset-password/:userId/:token
 * @method GET
 * @access public
 \**-------------------------------------------*/
 module.exports.getRessetPasswordLinkCtrl = asyncHandler(async (req, res) =>
{
    const user = await User.findOne(req.params.userId);
    if(!user)
    {
        return res.status(400).json({ message: 'Invalid Link' });
    }

    const verificationToken = await VerificationToken.findOne({  
        userId: user._id,
        token: req.params.token,
    });

    if(!verificationToken)
    {
        return res.status(400).json({ message: 'Invalid Link' });
    }

    res.status(200).json({ message: "Valid Link" })
});


/**--------------------------------------------
 * @desc Post New Password 
 * @router /api/password/reset-password/:userId/:token
 * @method POST
 * @access public
 \**-------------------------------------------*/
 module.exports.ressetPasswordCtrl = asyncHandler(async (req, res) =>
{
    //1.Validation
    const {password} = req.body;
    const valid = validateNewPassword({password});
    if(valid.error)
    {
        return res.status(400).json({ message: valid.error.details[0].message});
    }
    
    //2.Get the user from DB by email
    const user = await User.findById(req.params.userId);
    if(!user)
    {
        return res.status(400).json({ message: 'Invalid Link' });
    }

    //3.Creating Verification Token 
    let verificationToken = await VerificationToken.findOne({ userId: user._id, token: req.params.token });
    if(!verificationToken)
    {
        return res.status(400).json({ message: 'Invalid Link' });
    }

    //Verify Account User
    if(!user.isAccountVerified)
    {
        user.isAccountVerified = true;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    user.password = hashedPassword;
    await user.save();
    await VerificationToken.deleteOne({ _id: verificationToken._id });


    res.status(200).json({ message: "Password reset successfully, Try LogIn ! " });
})