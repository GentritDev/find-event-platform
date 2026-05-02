'use strict';

const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

function generateQRToken() {
  return uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '');
}

async function generateQRCodeDataURL(data) {
  return QRCode.toDataURL(data, {
    errorCorrectionLevel: 'H',
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
}

module.exports = { generateQRToken, generateQRCodeDataURL };
