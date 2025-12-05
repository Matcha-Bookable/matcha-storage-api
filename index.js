const express = require("express")
const mongoose = require("mongoose")
require("dotenv").config()

const healthRoutes = require("./routes/healthRoutes")
const logsRoutes = require("./routes/logsRoutes")
const User = require("./models/User")
// const demosRoutes = require("./routes/demosRoutes")

const app = express()
const port = process.env.PORT || 8080

app.use("/health", healthRoutes)
app.use("/api/logs", logsRoutes)
// app.use("/api/demos", demosRoutes)

mongoose.connect(process.env.MONGO_URI)
  .then(() => { console.log("- Connected to MongoDB") })
  .catch((error) => { console.error("Error connecting to MongoDB:", error) })

app.listen(port, () => {
  console.log(`- Listening on http://localhost:${port}`)
})