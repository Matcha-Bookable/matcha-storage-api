const express = require("express")
const router = express.Router()

const logsController = require("../controllers/logsController")
const { uploadSingle } = require("../middleware/uploadMiddleware")
const authMiddleware = require("../middleware/authMiddleware")

router.use(authMiddleware) // All endpoints require auth

router.get("/", logsController.getAllLogs) // list all logs
router.post("/", uploadSingle, logsController.uploadLog) // upload a log
router.get("/:id", logsController.getLog) // return a log's metadata
router.delete("/:id", logsController.deleteLog) // delete a log

module.exports = router