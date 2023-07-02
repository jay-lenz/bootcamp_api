const express = require('express')
const dotenv = require('dotenv')

const morgan = require('morgan')
const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')
const auth = require('./routes/auth')
const reviews = require('./routes/reviews')
const users = require('./routes/users')
const connectDb = require('./config/db')
const errorHandler = require('./middleware/error')
const colors = require('colors')
const fileupload = require('express-fileupload')
const path = require('path')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')

dotenv.config({ path: './config/config.env' })



connectDb();

const app = express()

//req.body parser 
app.use(express.json())

//cookie parser
app.use(cookieParser())

const logger = require('./middleware/logger')

// //logger middleware
// const logger = (req, res, next) =>{

//     console.log(`Middleware ran ${req.method} ${req.protocol}:// ${req.get('host')} ${req.originalUrl}`)
//     next() // tells the middleware to move on to the next middleware in the cycle
// }

// app.use(logger) ; //uses the middle ware
//Dev login middelware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

//file upload middleware
app.use(fileupload())

//sanitize data 
app.use(mongoSanitize())

//headaer protection
app.use(helmet())

//prevent cross site scripting
app.use(xss())

//rate limiting 
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, //10minutes
    max: 100
})

//prevent http param poluttion
app.use(hpp())

//enable cors
app.use(cors())

//setting static as static folder
app.use(express.static(path.join(__dirname, 'public')))

//mount routers
app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', courses)
app.use('/api/v1/auth', auth)
app.use('/api/v1/users', users)
app.use('/api/v1/reviews', reviews)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => { console.log(`server running in ${process.env.NODE_ENV} on port ${PORT}...😃`.blue.bold) })



//handle unhandled primise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Opps unhandled rejection😟\nError : ${err.message}`.red)
    server.close(() => { process.exit(1) })
})