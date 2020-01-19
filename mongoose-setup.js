/**
 * setup connection to mongodb.
 * please update line 10 if your connection details vary.
 * **DO NOT LEAVE AN UNAUTHENTICATED MONGODB PUBLICLY ACCESSIBLE**
 */

import mongoose from 'mongoose'

// setup mongoose with our dsn
const infosecawareDsn = typeof(process.env.MONGODB_URI)
  ? process.env.MONGODB_URI
  : 'mongodb://localhost/infosecaware'

mongoose.connect(infosecawareDsn, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

// these three sections setup mongoose with message to log on connect/disconnect/error events
mongoose.connection.on('connected', () => {
  console.log(`connected to mongodb server [${infosecawareDsn}]`)
})

mongoose.connection.on('error', (error) => {
  console.error(`connection to mongodb server [${infosecawareDsn}] failed: ${error}`)
})

mongoose.connection.on('disconnected', () => {
  console.log(`disconnected from mongodb server [${infosecawareDsn}]`)
})

// when node receives a SIGINT, cleanly disconnect from mongodb
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log(`process termination; disconnected from mongodb server [${infosecawareDsn}]`)
    process.exit(0)
  })
})

// load models
import './models/users.js'
import './models/loginSessions.js'
import './models/issues.js'
import './models/comments.js'
import './models/votes.js'
