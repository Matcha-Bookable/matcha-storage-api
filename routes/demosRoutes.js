const express = require("express")
const router = express.Router()

const demosController = require("../controllers/demosController")
const { uploadSingle } = require("../middleware/uploadMiddleware")
const authMiddleware = require("../middleware/authMiddleware")

router.use(authMiddleware) // All endpoints require auth

router.get("/", demosController.getAllDemos) // list all Demos
router.post("/", uploadSingle, demosController.uploadDemo) // upload a demo
router.get("/:id/metadata", demosController.getDemo) // return a log's metadata
router.delete("/:id", demosController.deleteDemo) // delete a log
router.delete("/booking/:id", demosController.deleteBooking) // delete all demos from a bookingID
// router.get("/:id", demosController.downloadDemo) // download the demo directly

module.exports = router