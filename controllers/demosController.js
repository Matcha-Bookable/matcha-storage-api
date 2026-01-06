const Demo = require("../models/Demo")
const { deleteObject, generatePresignedUploadUrl } = require("../services/r2Service")

exports.getAllDemos = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = 100
        const skip = (page - 1) * limit

        const total = await Demo.countDocuments()
        const demos = await Demo.find({}, { parsed: 0 })
            .sort({ uploadDate: -1 })
            .skip(skip)
            .limit(limit)

        if (demos.length == 0) {
            return res.status(404).json({
                status: "success",
                message: "Demos are not populated yet",
                demos: demos
            })
        }

        return res.status(200).json({
            status: "success",
            pagination: {
                page: page,
                totalPages: Math.ceil(total / limit),
                total: total,
            },
            demos: demos
        })

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
        const presignedUrl = await generatePresignedUploadUrl(process.env.R2_DEMO_BUCKET, storagePath, 60)

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
        var demo = await Demo.findById(req.params.id) // probably better to just include it for one demo

        if (demo.length == 0) {
            return res.status(404).json({
                status: "not found",
                message: "demoID not found"
            })
        }
        else {
            return res.status(200).json({
                status: "success",
                demo: demo
            })
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "error", message: "Failed to retrieve demo" })
    }
}

exports.downloadDemo = async (req, res) => {
    try {
        const demo = await Demo.findById(req.params.id)

        if (!demo) {
            return res.status(404).json({
                status: "not found",
                message: "DemoID not found"
            })
        }

        const downloadUrl = `${process.env.DEMO_BASE_URL}/${demo.storagePath}`

        return res.redirect(downloadUrl)

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "error", message: "Failed to download demo" })
    }
}

exports.deleteDemo = async (req, res) => {
    try {
        const id = req.params.id

        const droppedDemo = await Demo.findByIdAndDelete(id)

        if (!droppedDemo) {
            return res.status(404).json({ status: "not found", message: "DemoID not found" })
        }

        await deleteObject(process.env.R2_DEMO_BUCKET, droppedDemo.storagePath)

        return res.status(200).json({ status: "success", demo: droppedDemo })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "error", message: "Failed to delete demo" })
    }
}