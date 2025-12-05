const User = require("../models/User");

// Basic HTTP authorization header middleware
// we are authenicating on each request so JWT may come in useful in the future
module.exports = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ 
            status: "unauthorized",
            message: "No authorization header"
        })
    }

    // Bearer x
    const key = req.headers.authorization.split(" ")[1]
    const user = await User.findOne({ APIKEY: key })

    if (!user) {
        return res.status(401).json({
            status: "unauthorized",
            message: "Invalid authorization key"
        })
    }

	next();
}