// Represent a single Demo file
const mongoose = require("mongoose")

const demoSchema = new mongoose.Schema({
    bookingID: {
        type: Number,
        required: true,
        index: true,
        min: 1
    },
    demoName: { type: String, required: true },
    sourceAddress: { type: String, required: true},
    size: {
        type: Number,
        required: true,
        min: 1, // minimum 1 byte
        max: 100000000 // maximum 100 MB 
    },
    storagePath: { type: String, required: true},
    uploadDate: { type: Date, required: true},
    parsed: {
        type: mongoose.Schema.Types.Mixed,
        required: false
    }
})

module.exports = mongoose.model("Demo", demoSchema)