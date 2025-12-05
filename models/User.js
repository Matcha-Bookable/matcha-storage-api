// I think basic APIKEY authenication is more than sufficient for a backend to backend system
// Following matcha-api, will require a Bearer authorization header in requests
// Subject to change of course

const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    user: { type: String, required: true },
    APIKEY: { 
        type: String, 
        required: true, 
        minlength: 128, 
        maxlength: 128 
    },
    creationDate: { type: Date, required: true }
})

module.exports = mongoose.model("User", userSchema)