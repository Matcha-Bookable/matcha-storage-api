const Log = require("../models/Log")
const Demo = require("../models/Demo")
const { deleteObject } = require("../services/r2Service")

exports.getAllBookings = async (req, res) => {
    try {
        const logs = await Log.aggregate([
            {
                $group: {
                    _id: "$bookingID",
                    logs: { $push: "$$ROOT" }
                }
            }
        ])

        const demos = await Demo.aggregate([
            {
                $project: {
                    parsed: 0 // will blow up the server if set to 1
                }
            },
            {
                $group: {
                    _id: "$bookingID",
                    demos: { $push: "$$ROOT" }
                }
            }
        ])

        if (logs.length == 0 || demos.length == 0) {
            return res.status(404).json({ status: "not found", message: "Logs and Demos are not yet populated" })
        }

        const bookings = new Map()

        logs.forEach(log => {
            bookings.set(log._id, {
                bookingID: log._id,
                data: {
                    logs: log.logs,
                    demos: []
                }
            })
        })

        demos.forEach(demo => {
            if (bookings.has(demo._id)) { // if the bookingID exists
                bookings.get(demo._id).data.demos = demo.demos
            } else { // if we can't find logID, we create with demoID
                bookings.set(demo._id, {
                    bookingID: demo._id,
                    data: {
                        logs: [], // should be null
                        demos: demo.demos
                    }
                })
            }
        })

        return res.status(200).json({
            status: "success",
            bookings: Array.from(bookings.values())
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "error", message: "Failed to retrieve bookings" })
    }
}

exports.getBooking = async (req, res) => {
    try {
        const bookingID = parseInt(req.params.id)

        const logs = await Log.find({ bookingID })
        const demos = await Demo.find({ bookingID }, { parsed: 0 })

        if (logs.length === 0 && demos.length === 0) {
            return res.status(404).json({
                status: "not found",
                message: "No logs or demos found for this bookingID"
            })
        }

        return res.status(200).json({
            status: "success",
            booking: {
                bookingID,
                data: {
                    logs,
                    demos
                }
            }
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "error", message: "Failed to retrieve booking" })
    }
}

exports.deleteBookingLogs = async (req, res) => {
    try {
        const bookingID = req.params.id

        const logs = await Log.find({ bookingID })

        if (logs.length === 0) {
            return res.status(404).json({ status: "not found", message: "No logs found for this bookingID" })
        }

        for (const log of logs) {
            await deleteObject(process.env.R2_LOG_BUCKET, log.storagePath)
        }

        await Log.deleteMany({ bookingID })

        return res.status(200).json({ status: "success", message: `Deleted all logs for bookingID: ${bookingID}` })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "error", message: "Failed to delete booking logs" })
    }
}

exports.deleteBookingDemos = async (req, res) => {
    try {
        const bookingID = req.params.id

        const demos = await Demo.find({ bookingID })

        if (demos.length === 0) {
            return res.status(404).json({ status: "not found", message: "No demos found for this bookingID" })
        }

        for (const demo of demos) {
            await deleteObject(process.env.R2_DEMO_BUCKET, demo.storagePath)
        }

        await Demo.deleteMany({ bookingID })

        return res.status(200).json({ status: "success", message: `Deleted all demos for bookingID: ${bookingID}` })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "error", message: "Failed to delete booking demos" })
    }
}