const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv').config({ path: './config/config.env' })
const color = require('colors')

const Bootcamps = require('./models/Bootcamp')
const Course = require('./models/Course')
const User = require('./models/User')
const Review = require('./models/Review')

const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

mongoose.connect(process.env.MONGO_URI, connectionParams)

const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'))
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'))


//import into db 
const importData = async () => {
    try {
        await Bootcamps.create(bootcamps)
        await Course.create(courses)
        await User.create(users)
        await Review.create(reviews)
        console.log(`Data imported`.green.inverse)
        process.exit()
    } catch (err) {
        console.log(err)
    }
}

//delete data
const deleteData = async () => {
    try {
        await Bootcamps.deleteMany()
        await Course.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log(`Data destroyed`.red.inverse)
        process.exit()
    } catch (err) {
        console.log(err)
    }
}
// node seeder -i
if (process.argv[2] === '-i') {
    importData()
} else if (process.argv[2] === '-d') {
    deleteData()
}
