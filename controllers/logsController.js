const Log = require("../models/Log")
const { uploadObject, deleteObject } = require("../services/r2Service")

exports.getAllLogs = async (req, res) => {
    try {
        const logs = await Log.find();

        if (logs.length === 0) {
            return res.status(404).json({
                status: "not found",
                message: "Logs are not populated yet",
                logs: logs
            })
        }
        else {
            return res.status(200).json({
                status: "success",
                logs: logs
            })
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "error", message: "Failed to retrieve logs"})
    }
}

exports.uploadLog = async (req, res) => {
    try {
        const bookingID = req.body.bookingID
        
        if (!bookingID) {
            return res.status(400).json({ status: "error", message: "bookingID is required" })
        }

        if (!req.file) {
            return res.status(400).json({ status: "error", message: "No file uploaded" })
        }

        // Log metadatas
        const fileName = req.file.originalname
        const fileContent = req.file.buffer
        const fileSize = req.file.size

        // validate the file size
        if (fileSize > 10000000 || fileSize < 1) {
            return res.status(400).json({ status: "error", message: "File size should be between 1 byte and 10 MB" })
        }

        // Behind proxy
        const sourceAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection.remoteAddress

        const bucketName = process.env.R2_LOG_BUCKET
        const storagePath = `${bookingID}/${fileName}`
        
        await uploadObject(bucketName, storagePath, fileContent)

        try {
            const newLog = new Log({
            bookingID: parseInt(bookingID),
            logName: fileName,
            sourceAddress: sourceAddress,
            size: fileSize,
            storagePath: storagePath,
            uploadDate: new Date()
        })

            await newLog.save()


            return res.status(201).json({
            status: "success",
            log: newLog
            })
            
        } catch (DuplicateKeyError) {
            return res.status(409).json({ status: "error", message: "document already exists" }) 
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "error", message: "Failed to upload log" })
    }
}

exports.getLog = async (req, res) => {
    try {
        const log = await Log.findById(req.params.id)

        if (log.length == 0) {
            return res.status(404).json({
                status: "not found",
                message: "LogID not found"
            })
        }
        else {
            return res.status(200).json({
                status: "success",
                log: log
            })
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "error", message: "Failed to retrieve log" })
    }
}

exports.deleteLog = async (req, res) => {
    try {
        const id = req.params.id

        // Find and delete the log, get the storagePath before deletion
        const droppedLog = await Log.findByIdAndDelete(id)

        if (!droppedLog) {
            return res.status(404).json({
                status: "not found",
                message: "Log not found"
            })
        }

        await deleteObject(process.env.R2_LOG_BUCKET, droppedLog.storagePath)

        return res.status(200).json({ status: "success", log: droppedLog })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "error", message: "Failed to delete log" })
    }
}