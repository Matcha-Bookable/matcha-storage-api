const mongoose = require("mongoose")

exports.healthCheck = async (req, res) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    }
    
    const statusCode = mongoose.connection.readyState === 1 ? 200 : 503
    return res.status(statusCode).json(health)
    
  } catch (error) {
    console.error("Health check error:", error)
    return res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed'
    })
  }
}
