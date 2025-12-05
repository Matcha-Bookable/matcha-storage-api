const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  waitUntilObjectNotExists,
} = require("@aws-sdk/client-s3")

const newS3Client = function () {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  })
}

/**
 * Upload a object to a S3 bucket.
 * @param {string} bucketName
 * @param {string} fileName
 * @param {Buffer} fileContent
 */
const uploadObject = async (bucketName, fileName, fileContent) => {
    const client = newS3Client()

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: fileContent
    })

    try {
        await client.send(command)
    } catch(error) {
        throw error
    }
}

/**
 * Delete one object from a S3 bucket.
 * @param { string } bucketName
 * @param { string } fileName
 */
const deleteObject = async (bucketName, fileName) => {
  const client = newS3Client()

  const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: fileName,
  })

  try {
    await client.send(command)
    await waitUntilObjectNotExists(
      { client },
      { Bucket: bucketName, Key: fileName },
    )
  } catch (error) {
      throw error
    }
}

module.exports = { uploadObject, deleteObject }
