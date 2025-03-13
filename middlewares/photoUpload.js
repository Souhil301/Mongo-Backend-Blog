const path = require('path'),
      multer = require('multer')



//Photo Storage 
const photOStorage = multer.diskStorage(
    {
        destination: function(req, file, cb)
        {
            cb(null, path.join(__dirname, "../images"));
        },
        filename: function(req, file, cb)
        {
            if(file)
            {
                cb(null, new Date().toISOString().replace(/:/g, '-')+ file.originalname)
            }
            else
            {
                cb(null, false)
            }
        }
    }
);

//Photo Uplode Middleware
const photoUpload = multer(
    {
        storage: photOStorage,
        fileFilter: function(req, file, cb)
        {
            if(file.mimetype.startsWith('image'))
            {
                cb(null, true)
            }
            else
            {
                cb({ message: "Unsupported file format"}, false);
            }
        },
        limits: { fileSize: 1024 * 1024 * 2}, // 1 megabyte max
    }
)

module.exports = photoUpload;
