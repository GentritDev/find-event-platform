'use strict';

const { getImageKit } = require('../../config/imagekit');
const env = require('../../config/env');

class UploadsService {
  async uploadImage(fileBuffer, fileName, folder = 'events') {
    const imagekit = getImageKit();

    const result = await imagekit.upload({
      file: fileBuffer,
      fileName: fileName,
      folder: `/${folder}`,
      useUniqueFileName: true,
    });

    return {
      url: result.url,
      fileId: result.fileId,
      name: result.name,
    };
  }
}

module.exports = new UploadsService();
