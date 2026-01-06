const express = require("express")
const router = express.Router()

const bookingsController = require("../controllers/bookingsController")
const authMiddleware = require("../middleware/authMiddleware")

router.use(authMiddleware) // All endpoints require auth
router.use(express.json()) // Parse JSON bodies

router.get("/", bookingsController.getAllBookings) // list all demos and logs
router.get("/:id", bookingsController.getBooking) // return a booking's demos and logs
router.delete("/:id/logs", bookingsController.deleteBookingLogs) // delete all logs for a bookingID
router.delete("/:id/demos", bookingsController.deleteBookingDemos) // delete all demos for a bookingID

module.exports = router