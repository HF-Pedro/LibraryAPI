const { Int32 } = require('mongodb')
const mongoose = require('mongoose')

const Book = mongoose.model('Book',{
    isbn: String,
    title: String,
    author: String,
    amount: Number
})

module.exports = Book