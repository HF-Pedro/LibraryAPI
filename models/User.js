const mongoose = require('mongoose')

const User = mongoose.model('User',{
    name: String,
    ra: String,
    email: String,
    password: String,
    role: String,
    state: String
})

module.exports = User