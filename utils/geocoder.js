const NodeGeocoder = require('node-geocoder')

const options = {
    provider: process.env.GEOCODER_PROVIDER,
    httpAdapter: 'https',
    apiKey: proces.env.GOOGLE_APIKEY,
    formatter: null
}

const geocoder = NodeGeocoder(options)

module.exports = geocoder