const express = require("express")
const router = express.Router()

const demosController = require("../controllers/demosController")
const { uploadSingle } = require("../middleware/uploadMiddleware")
const authMiddleware = require("../middleware/authMiddleware")

router.use(express.json()) // Parse JSON bodies

// Exposed to public
router.get("/", demosController.getAllDemos) // list all Demos
router.get("/:id", demosController.getDemo) // return a demo's metadata
router.get("/:id/download", demosController.downloadDemo) // get demo download URL

// Require auth
router.post("/presigned-url", authMiddleware, demosController.getPresignedUploadUrl) // get presigned URL for upload
router.post("/", authMiddleware, demosController.uploadDemo) // save demo metadata after client upload
router.delete("/:id", authMiddleware, demosController.deleteDemo) // delete a demo

module.exports = router