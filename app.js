import { dirname, join } from 'path'
import cookieParser from 'cookie-parser'
import createError from 'http-errors'
import express from 'express'
import logger from 'morgan'

import routes from './controllers/routes.js'
import './mongoose-setup.js'

const app = express()

// view engine setup
app.set('views', join(dirname('.'), 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(join(dirname('.'), 'public')))

app.use('/', routes)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

export default app
