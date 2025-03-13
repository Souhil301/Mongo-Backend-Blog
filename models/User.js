const mongoose              = require('mongoose');
const joi                   = require('joi');
const jwt                   = require('jsonwebtoken');
const passwordComplexity    = require('joi-password-complexity');




const userSchema = new mongoose.Schema(
    {
        username: 
        {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },
        email: 
        {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
            maxlength: 100,
            unique: true,
        },
        password: 
        {
            type: String,
            required: true,
            trim: true,
            minlength: 8,
        },
        profilePhoto:
        {
            type: Object,
            default:
            {
                    url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
                    publicId: null
            }
        },
        bio:
        {
            type: String,
            default: "",
        },
        isAdmin:
        {
            type: Boolean,
            default: false,
        },
        isAccountVerified:
        {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Populate Posts That Belongs to this user when he/she Get his/her Profile
userSchema.virtual('posts',
{
    ref: 'Post',
    foreignField: 'user',
    localField: '_id',
})

//Generate  Token
userSchema.methods.generateAuthToken = function()
{
    return jwt.sign({id: this._id, isAdmin: this.isAdmin}, process.env.JWT_SECRET)
}

//User Model
const User = mongoose.model('User', userSchema);

function validateRegisterUser(obj)
{
    const schema = joi.object(
        {
            username: joi.string().trim().min(2).max(100).required(),
            email: joi.string().trim().min(5).max(100).required().email(),
            password: passwordComplexity().required(),
        }
    )
    return schema.validate(obj);
}


function validateLoginUser(obj)
{
    const schema = joi.object(
        {
            email: joi.string().trim().min(5).max(100).required().email(),
            password: passwordComplexity().required(),
        }
    )
    return schema.validate(obj);
}

//Validate Update user 
function validateUpdateUser(obj)
{
    const schema = joi.object(
        {
            username: joi.string().trim().min(2).max(100),
            bio: joi.string().trim().min(5).max(100),
            password: passwordComplexity(), 
        }
    )
    return schema.validate(obj);
}


function validateEmail(obj)
{
    const schema = joi.object(
        {
            email: joi.string().trim().min(5).max(100).required().email(),
        }
    )
    return schema.validate(obj);
}


function validateNewPassword(obj)
{
    const schema = joi.object(
        {
            password: passwordComplexity().required(),
        }
    )
    return schema.validate(obj);
}

module.exports = 
{
    User,
    validateRegisterUser,
    validateLoginUser,
    validateUpdateUser, 
    validateNewPassword,
    validateEmail
}