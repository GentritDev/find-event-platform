'use strict';

const ImageKit = require('imagekit');
const env = require('./env');

let _imagekit = null;

function getImageKit() {
  if (!_imagekit) {
    if (!env.IMAGEKIT_PUBLIC_KEY || !env.IMAGEKIT_PRIVATE_KEY || !env.IMAGEKIT_URL_ENDPOINT) {
      const err = new Error('ImageKit credentials not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT.');
      err.status = 503;
      throw err;
    }
    _imagekit = new ImageKit({
      publicKey: env.IMAGEKIT_PUBLIC_KEY,
      privateKey: env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
    });
  }
  return _imagekit;
}

module.exports = { getImageKit };
