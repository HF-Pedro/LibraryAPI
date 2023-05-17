
const mongoose = require('mongoose')

const Book = mongoose.model('Book',{
    isbn: String,
    title: String,
    author: String,
    year: String,
    pub: String,
    genre: String,
    sin: String,
    amount: Number
})

module.exports = Book