const Demo = require("../models/Demo")
const { uploadObject, deleteObject } = require("../services/r2Service")
const { parseDemo } = require('../services/demoParser');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const zlib = require('zlib');
const { promisify } = require('util');

const gzipAsync = promisify(zlib.gzip);

exports.getAllDemos = async (req, res) => {
    try {
        // We should allow the option to not show parsed data
        const parsed = req.query.parsed

        var demos
        
        if (parsed) {
            demos = await Demo.find()
        }
        else {
            demos = await Demo.find({}, { parsed: 0 })
        }

        if (demos.length == 0) {
            return res.status(404).json({
                status: "success",
                message: "Demos are not populated yet",
                demos: demos
            })
        }

        return res.status(200).json(demos)
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "error", message: "Failed to retrieve demos"})
    }
}

exports.uploadDemo = async (req, res) => {
    try {
        const bookingID = req.body.bookingID

        if (!bookingID) {
            return res.status(400).json({ status: "error", message: "bookingID is required" })
        }

        if (!req.file) {
            return res.status(400).json({ status: "error", message: "No file uploaded" })
        }

        // demos metadatas
        const fileName = req.file.originalname
        const fileContent = req.file.buffer
        const fileSize = req.file.size

        // validate the file size
        if (fileSize > 200000000 || fileSize < 5000000) {
            return res.status(400).json({ status: "error", message: "File size should be between 5MB and 200 MB" })
        }

        // Behind proxy
        const sourceAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection.remoteAddress
        const bucketName = process.env.R2_DEMO_BUCKET
        const storagePath = `${bookingID}/${fileName}.gz`
        
        // upload
        await uploadObject(bucketName, storagePath, await gzipAsync(fileContent))

        // store in RAM
        const tempDir = os.tmpdir();
        const tempFilePath = path.join(tempDir, `demo-${Date.now()}-${fileName}`);
        
        try {
            await fs.writeFile(tempFilePath, fileContent);
            const parsedData = await parseDemo(tempFilePath);

            const newDemo = new Demo({
                bookingID: bookingID,
                demoName: fileName,
                sourceAddress: sourceAddress,
                size: fileSize,
                storagePath: storagePath,
                uploadDate: new Date(),
                parsed: parsedData
            })

            await newDemo.save()
            
            return res.status(201).json({
                status: "success",
                demo: newDemo
            })
            
        } catch (DuplicateKeyError) {
            return res.status(409).json({ status: "error", message: "document already exists" }) 
        } finally {
            // Clean up temp file
            try {
                await fs.unlink(tempFilePath);
            } catch (err) {
                console.error('Failed to delete temp file:', err);
            }
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "error", message: "Failed to upload demo" })
    }
}

exports.getDemo = async (req, res) => {
    try {
        const demo = await Demo.findById(req.params.id)

        if (demo.length == 0) {
            return res.status(404).json(demo)
        }
        else {
            return res.status(200).json(demo)
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "error", message: "Failed to retrieve demo" })
    }
}

exports.deleteDemo = async (req, res) => {
    try {
        const id = req.params.id
        
        const droppedDemo = await Demo.findByIdAndDelete(id)

        if (!droppedDemo) {
            return res.status(404).json({ error: "Demo not found" })
        }

        await deleteObject(process.env.R2_DEMO_BUCKET, droppedDemo.storagePath)

        return res.status(200).json({ status: "success", demo: droppedDemo })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "error", message: "Failed to delete demo" })
    }
}

exports.deleteBooking = async (req, res) => {
    try {
        const id = req.params.id

        const demos = await Demo.find({ bookingID: id })

        if (demos.length == 0) {
            return res.status(404).json({ status: "error", message: "No demos found for this bookingID" })
        }

        for (const demo of demos) {
            await deleteObject(process.env.R2_DEMO_BUCKET, demo.storagePath)
        }

        await Demo.deleteMany({ bookingID: id })

        return res.status(200).json({ status: "success", message: `Deleted all demos for bookingID: ${id}` })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "error", message: "Failed to delete demos" })
    }
}