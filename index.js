require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const { FaceDetection, FaceRecognition } = require('./helpers/azure')

app.disable('x-powered-by')
app.use(express.json())

app.get('/', function (req, res) {
  return res.json({
    status: true,
    message: 'Azure REST API'
  })
})

app.get('/detection', async function (req, res) {
  try {
    const { url } = req.query
    if (url) {
      return res.json(await FaceDetection(url))
    } else {
      return res.json({
        status: false,
        message: 'Invalid parameter'
      })
    }
  } catch (err) {
    return res.json({
      status: false,
      message: err.message
    })
  }
})

app.get('/recognition', async function (req, res) {
  try {
    const { url, currentId } = req.query
    if (url && currentId) {
      return res.json(await FaceRecognition(url, currentId))
    } else {
      return res.json({
        status: false,
        message: 'Invalid parameter'
      })
    }
  } catch (err) {
    return res.json({
      status: false,
      message: err.message
    })
  }
})

app.listen(port, function () {
  console.log('Server listening at port %s', port)
})