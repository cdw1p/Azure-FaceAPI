const request = require('request')

const ValidationURL = (url) => {
  var pattern = new RegExp('^(https?:\\/\\/)?' +
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' +
    '((\\d{1,3}\\.){3}\\d{1,3}))' +
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
    '(\\?[;&a-z\\d%_.~+=-]*)?' +
    '(\\#[-a-z\\d_]*)?$', 'i')
  return pattern.test(url)
}

const FaceDetection = (url) => {
  try {
    const testURL = ValidationURL(url)
    if (testURL) {
      const options = {
        uri: `https://${process.env.AZURE_ENDPOINT}/face/v1.0/detect`,
        qs: { returnFaceId: 'true', returnFaceLandmarks: 'false', returnFaceAttributes: '' },
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': process.env.AZURE_APIKEY
        }
      }
      options.body = JSON.stringify({ url })

      return new Promise((resolve, reject) => {
        request.post(options, (error, response, body) => {
          if (error) {
            reject(error)
          }

          const responseBody = JSON.parse(body)
          if (responseBody.error) {
            resolve({
              status: false,
              message: responseBody.error.message
            })
          } else {
            if (responseBody.length > 0 && responseBody.length < 2) {
              resolve({
                status: true,
                message: JSON.parse(body)[0].faceId
              })
            } else if (responseBody.length == 0) {
              resolve({
                status: false,
                message: 'Not one face detected.'
              })
            } else {
              resolve({
                status: false,
                message: 'System does`t allowed multiple people.'
              })
            }
          }
        })
      })
    } else {
      return Promise.resolve({
        status: false,
        message: 'A URL is badly formed or contains invalid characters.'
      })
    }
  } catch (err) {
    return Promise.resolve({
      status: false,
      message: err.message
    })
  }
}

const FaceRecognition = async (url, currentId) => {
  try {
    const resFaceDetection = await FaceDetection(url)
    if (resFaceDetection.status) {
      const options = {
        uri: `https://${process.env.AZURE_ENDPOINT}/face/v1.0/verify`,
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': process.env.AZURE_APIKEY
        }
      }
      options.body = JSON.stringify({ faceId1: currentId, faceId2: resFaceDetection.message })

      return new Promise((resolve, reject) => {
        request.post(options, (error, response, body) => {
          if (error) {
            reject(error)
          }

          const responseBody = JSON.parse(body)
          if (responseBody.error) {
            resolve({
              status: false,
              message: responseBody.error.message
            })
          } else {
            resolve({
              status: true,
              message: responseBody
            })
          }
        })
      })
    } else {
      return Promise.resolve({
        status: false,
        message: resFaceDetection.message
      })
    }
  } catch (err) {
    return Promise.resolve({
      status: false,
      message: err.message
    })
  }
}

module.exports = {
  FaceDetection,
  FaceRecognition
}