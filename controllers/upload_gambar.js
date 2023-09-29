const multer = require(`multer`)
const path = require(`path`)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../gambar'))
    },
    filename: (req, file, cb) => {
        cb(null, `gambar-${Date.now()}${path.extname(file.originalname)}`)
    }
})
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {

        const acceptedType = [`image/jpg`, `image/jpeg`, `image/png`,`image/jfif`]
        if (!acceptedType.includes(file.mimetype)) {
            cb(null, false)
            return cb(`Invalid file type (${file.mimetype})`)
        }
        const fileSize = req.headers[`content-length`]
        const maxSize = (5 * 1024 * 1024)
        if (fileSize > maxSize) {
            cb(null, false)
            return cb(`File size is too large`)
        }
        cb(null, true)
    }
})
module.exports = upload