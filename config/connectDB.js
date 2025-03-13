const mongoose = require('mongoose');
require('dotenv').config();


module.exports = async() =>
{
    try {
        mongoose.connect(process.env.URI, {})
        console.log('Connect To DB ^_^')
    } catch (error) {
        console.log('Connection DB Failed: ',error)
    }
}