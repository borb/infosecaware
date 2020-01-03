import express from 'express'
import landingcontroller from '../controllers/server/landingcontroller.js'

const router = express.Router()

router
    .get('/', landingcontroller)
    .post('/', landingcontroller)

export default router
