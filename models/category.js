const mongoose = require('mongoose');
const joi = require('joi');


//Category Schema
const categorySchema = new mongoose.Schema(
    {
        user:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title:
        {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

//Category Model 
const Category = mongoose.model('Category', categorySchema);

// Validate Create Comment 
function validateCategory(obj)
{
    const schema = joi.object(
        {
            title: joi.string().trim().required().label('Title'),
        }
    );
    return schema.validate(obj);
}



module.exports = 
{
    Category,
    validateCategory,
}