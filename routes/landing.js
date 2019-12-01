var express = require('express')
var router = express.Router()
var landingcontroller = require('../controllers/server/landingcontroller')

router
    .get('/', landingcontroller.index)
    .post('/', landingcontroller.index)

module.exports = router
