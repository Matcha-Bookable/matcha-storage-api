// Represent a single Log file
const mongoose = require("mongoose")

const logSchema = new mongoose.Schema({
    bookingID: {
        type: Number,
        required: true,
        index: true,
        min: 1
    },
    logName: { type: String, required: true },
    sourceAddress: { type: String, required: true},
    size: {
        type: Number,
        required: true,
        min: 1, // minimum 1 byte
        max: 10000000 // maximum 10 MB 
    },
    storagePath: { type: String, required: true},
    uploadDate: { type: Date, required: true}
})

module.exports = mongoose.model("Log", logSchema)