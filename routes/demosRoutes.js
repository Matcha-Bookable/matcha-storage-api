const express = require("express")
const router = express.Router()

const demosController = require("../controllers/demosController")
const { uploadSingle } = require("../middleware/uploadMiddleware")
const authMiddleware = require("../middleware/authMiddleware")

router.use(authMiddleware) // All endpoints require auth
router.use(express.json()) // Parse JSON bodies

router.get("/", demosController.getAllDemos) // list all Demos
router.post("/presigned-url", demosController.getPresignedUploadUrl) // get presigned URL for upload
router.post("/", demosController.uploadDemo) // save demo metadata after client upload
router.get("/:id/metadata", demosController.getDemo) // return a log's metadata
router.delete("/:id", demosController.deleteDemo) // delete a log
router.delete("/booking/:id", demosController.deleteBooking) // delete all demos from a bookingID
// router.get("/:id", demosController.downloadDemo) // download the demo directly

module.exports = router