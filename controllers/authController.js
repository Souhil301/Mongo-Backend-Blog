const asyncHandler                                      =   require('express-async-handler'),
      bcrypt                                            =   require('bcrypt'),
      { User, validateRegisterUser, validateLoginUser } =   require('../models/User'),
      VerificationToken                                 = require('../models/VerificationToken'),
      crypto                                            = require('crypto'),
      sendEmail                                         = require('../utils/sendEmail');

/**--------------------------------------------
 * @desc Register New User
 * @router /api/auth/register
 * @method POST
 * @access public
 \**-------------------------------------------*/
 module.exports.registerUserCtrl = asyncHandler( async (req, res) =>
 {
    const valid = validateRegisterUser(req.body);
    if(valid.error)
    {
        return res.status(400).json({ message: valid.error.details[0].message});
    }

    let user = await User.findOne({ email: req.body.email});
    if(user)
    {
        return res.status(400).json({ message: "user already exist !" })
    }

    const salt = await bcrypt.genSalt(10);
    const hpassword = await bcrypt.hash(req.body.password, salt);

    user = new User(
        {
            username: req.body.username,
            email: req.body.email,
            password: hpassword,
        });
    
    await user.save();
    //Creating new VerificationToken & save it to DB
    const verificationToken = new VerificationToken({
        userId: user._id,
        token: crypto.randomBytes(32).toString('hex'),
    })
    
    await verificationToken.save();

    //Making the link
    const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`;
    
   //Putting the link into a HTML template
    const htmlTemplate = `
        <div>
            <p>Click on the link below to verify your email</p>
            <a href='${link}'>Verify</a>
        </div>
    `   
  
    //Sending email to the user 
    try {
        await sendEmail(user.email, "Verify Your Email", htmlTemplate);
        console.log("Email sent successfully.");
    } catch (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Failed to send verification email." });
    }

    //Response to the client  
    res.status(201).json({ message: "We sent to you an email, please verify your email address"});
 });


 /**--------------------------------------------
 * @desc Login User
 * @router /api/auth/Login
 * @method POST
 * @access public
 \**-------------------------------------------*/
 module.exports.loginUserCtrl = asyncHandler( async (req, res) =>
 {
    const valid = validateLoginUser(req.body);
    if(valid.error)
    {
        return res.status(400).json({ message: valid.error.details[0].message});
    }

    let user = await User.findOne({ email: req.body.email});
    if(!user)
    {
        return res.status(400).json({ message: "Invalid email or password !"})
    }

    const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
    if(!isPasswordMatch)
    {
        return res.status(400).json({ message: "Invalid email or password !"})
    }

    //Email verification 
    if(!user.isAccountVerified)
    {
        let verificationToken = await VerificationToken.findOne({
            userId: user._id,
        });

        if(!verificationToken)
        {
            verificationToken = new VerificationToken({
                userId: user._id,
                token: crypto.randomBytes(32).toString('hex'),
            });
            await verificationToken.save();
        }
    
            //Making the link
            const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`;
            
            //Putting the link into a HTML template
            const htmlTemplate = `
                <div>
                    <p>Click on the link below to verify your email</p>
                    <a href='${link}'>Verify</a>
                </div>
            `   
        
            //Sending email to the user 
            try {
                await sendEmail(user.email, "Verify Your Email", htmlTemplate);
                console.log("Email sent successfully.");
            } catch (error) {
                console.error("Error sending email:", error);
                return res.status(500).json({ message: "Failed to send verification email." });
            }
        
        return res.status(400).json({ message: "We sent to you an email, please verify your email address"});
    }

    const token = user.generateAuthToken();
    res.status(200).json({
      _id: user._id,
      isAdmin: user.isAdmin,
      profilePhoto: user.profilePhoto,
      token,
      username: user.username,
    });

 });


/**--------------------------------------------
 * @desc Verify Email Account
 * @router /api/auth/:userId/verify/:token
 * @method GET
 * @access public
 \**-------------------------------------------*/
 module.exports.verifyEmailAccountCtrl = asyncHandler( async (req, res) =>
 {
    const user = await User.findById(req.params.userId);

    if(!user)
    {
        return res.status(400).json({ message:'Invalid Link' })
    }

    const verificationToken = await VerificationToken.findOne({
        userId: user._id,
        token: req.params.token,
    });

    if(!verificationToken)
    {
        return res.status(400).json({ message:'Invalid Link' })
    }

    user.isAccountVerified = true;
    await user.save();

    await VerificationToken.deleteOne({ _id: verificationToken._id });

    res.status(200).json({ message: "Your account verified" })
 })