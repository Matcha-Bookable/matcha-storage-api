const express = require("express")
const mongoose = require("mongoose")
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')
require("dotenv").config()

const healthRoutes = require("./routes/healthRoutes")
const logsRoutes = require("./routes/logsRoutes")
const demosRoutes = require("./routes/demosRoutes")
const bookingsRoutes = require("./routes/bookingsRoutes")

const app = express()
const port = process.env.PORT || 8080

app.use("/api/health", healthRoutes)
app.use("/api/logs", logsRoutes)
app.use("/api/demos", demosRoutes)
app.use("/api/bookings", bookingsRoutes)

// Doc
const swaggerDoc = YAML.load("./openapi.yaml")
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc))

app.get("/", async (req, res) => {
  return res.redirect("/api/docs")
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => { console.log("- Connected to MongoDB") })
  .catch((error) => { console.error("Error connecting to MongoDB:", error) })

app.listen(port, () => {
  console.log(`- Listening on http://localhost:${port}`)
})