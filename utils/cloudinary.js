const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// UPLOAD IMAGE
const cloudinaryUploadImage = async (fileToUpload) => {
  try {    
    const data = await cloudinary.uploader.upload(fileToUpload, {
      resource_type: 'auto',
    });
    return data;
  } catch (error) {
     console.log(error);
     throw new Error('Internal Server Error (Clouddinary)');
    }
};


// Remove IMAGE
const cloudinaryRemoveImage = async (publicId) => {
    try {
      const res = await cloudinary.uploader.destroy(publicId);
      return res;
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error (Clouddinary)');    
    }
};


// Remove Multiple IMAGE
const cloudinaryRemoveMultipleImage = async (publicIds) => {
  try {
    const res = await cloudinary.api.delete_resources(publicIds);
    return res;
  } catch (error) 
  {
    console.log(error);
    throw new Error('Internal Server Error (Clouddinary)');
    }
};


module.exports = 
{
    cloudinaryUploadImage,
    cloudinaryRemoveImage,
    cloudinaryRemoveMultipleImage,
}