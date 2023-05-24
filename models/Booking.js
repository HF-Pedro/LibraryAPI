
const mongoose = require('mongoose')

const Booking = mongoose.model('Booking',{

    info:{
        startDate: Date,
        userRa: String,
        bookIsbn: String,
        endDate: Date,
        status: String,
        qrCode: String
        
    }
})

module.exports = Booking