
const mongoose = require('mongoose')

const Booking = mongoose.model('Booking',{

    info:{
        startDate: Date,
        userRa: String,
        bookIsbn: String,
        endDate: Date,
        status: String,

    },
    file:{
        data: Buffer,
        contentType: String

    }
})

module.exports = Booking