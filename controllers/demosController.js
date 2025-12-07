const Demo = require("../models/Demo")
const { uploadObject, deleteObject, generatePresignedUploadUrl } = require("../services/r2Service")

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

exports.getPresignedUploadUrl = async (req, res) => {
    try {
        const { bookingID, fileName } = req.body

        if (!bookingID) {
            return res.status(400).json({ status: "error", message: "bookingID is required" })
        }

        if (!fileName) {
            return res.status(400).json({ status: "error", message: "fileName is required" })
        }

        const storagePath = `${bookingID}/${fileName}.gz`
        const presignedUrl = await generatePresignedUploadUrl(process.env.R2_DEMO_BUCKET, storagePath, 180)

        return res.status(200).json({
            status: "success",
            presignedUrl: presignedUrl,
            storagePath: storagePath
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "error", message: "Failed to generate presigned URL" })
    }
}

exports.uploadDemo = async (req, res) => {
    try {
        const { bookingID, demoName, size, storagePath, parsed } = req.body

        if (!bookingID) {
            return res.status(400).json({ status: "error", message: "bookingID is required" })
        }

        if (!demoName) {
            return res.status(400).json({ status: "error", message: "demoName is required" })
        }

        if (!size) {
            return res.status(400).json({ status: "error", message: "size is required" })
        }

        if (!storagePath) {
            return res.status(400).json({ status: "error", message: "storagePath is required" })
        }

        // validate the file size
        // if (size > 200000000 || size < 5000000) {
        //     return res.status(400).json({ status: "error", message: "File size should be between 5MB and 200 MB" })
        // }

        // Behind proxy
        const sourceAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection.remoteAddress
        
        try {
            const newDemo = new Demo({
                bookingID: bookingID,
                demoName: demoName,
                sourceAddress: sourceAddress,
                size: size,
                storagePath: storagePath,
                uploadDate: new Date(),
                parsed: parsed
            })

            await newDemo.save()
            
            return res.status(201).json({
                status: "success",
                demo: newDemo
            })
            
        } catch (DuplicateKeyError) {
            return res.status(409).json({ status: "error", message: "document already exists" }) 
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