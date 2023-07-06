const Course = require('../models/Course')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');


//@route GET /api/v1/courses
//       GET /api/v1/bootcamps/:bootcampId/courses
exports.getCourses = asyncHandler(async (req, res, nex) => {

    /*
    // let query;
    // let reqQuery = { ...req.query }
    // let queryString = JSON.stringify(reqQuery)
    // let removefield = ['select', 'sort', 'limit', 'page']
    // removefield.forEach(x => delete (reqQuery[x]))
    // console.log(queryString)

    // if (req.params.bootcampId) {
    //     query = Course.find({ bootcamp: req.params.bootcampId })
    // } else {
    //     query = Course.find().populate({
    //         path: 'bootcamp',
    //         select: 'name description housing'
    //     })
    // }
    // queryString = queryString.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)
    // if (req.params.bootcampId) {
    //     query = Course.find({ bootcamp: req.params.bootcampId })
    // } else {
    //     query = Course.find(JSON.parse(queryString)).populate({
    //         path: 'bootcamp',
    //         select: 'name description housing'
    //     })
    // }
    // // query = Course.find(JSON.parse(queryString))
    // console.log(req.query)
    // if (req.query.select) {
    //     const fields = req.query.select.split(',').join(' ')
    //     query = query.select(fields)
    //     console.log(fields)
    // }
    // if (req.query.sort) {
    //     const sortBy = req.query.sort.split(',').join(' ')
    //     query = query.sort(sortBy)

    // } else {
    //     query = query.sort('-tuition')
    // }
    // const page = parseInt(req.query.page, 10) || 1
    // const limit = parseInt(req.query.limit, 10) || 100
    // const startIndex = (page - 1) * limit
    // const endIndex = page * limit
    // const total = await Course.countDocuments()
    // query = query.skip(startIndex).limit(limit)
    // const pagination = {}
    // if (endIndex < total) {
    //     pagination.next = {
    //         page: page + 1,
    //         limit
    //     }
    // }
    // if (startIndex > 0) {
    //     pagination.prev = {
    //         page: page - 1,
    //         limit
    //     }
    // } 
    // const courses = await query
    */

    if (req.params.bootcampId) {
        const courses = await Course.find({ bootcamp: req.params.bootcampId })
        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
    } else {
        res.status(200).json(res.advancedResults)
    }

})


exports.getCourse = asyncHandler(async (req, res, next) => {

    const course = await Course.findById(req.params.id).populate({ path: 'bootcamp', select: 'name description' })

    if (!course) {
        next(new ErrorResponse(`No course with Id ${res.params.id}`, 404))
        return
    }
    res.status(200).json({ success: true, data: course })
})

exports.addCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)
    if (!bootcamp) {
        next(new ErrorResponse(`No bootcamp with Id ${res.params.bootcampId} exist`, 404))
        return
    }
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        next(new ErrorResponse(`User  ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`, 404))
        return
    }
    const course = await Course.create(req.body)
    res.status(200).json({ success: true, data: course })
})


exports.updateCourse = asyncHandler(async (req, res, next) => {

    let course = await Course.findById(req.params.id)
    if (!course) {
        next(new ErrorResponse(`No course with Id ${res.params.id} exist`, 404))
        return
    }
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        next(new ErrorResponse(`User  ${req.user.id} is not authorized to update a course to bootcamp ${course._id}`, 404))
        return
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    res.status(200).json({ success: true, data: course })
})

exports.deleteCourse = asyncHandler(async (req, res, next) => {

    const course = await Course.findById(req.params.id)
    if (!course) {
        next(new ErrorResponse(`No course with Id ${res.params.id} exist`, 404))
        return
    }
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        next(new ErrorResponse(`User  ${req.user.id} is not authorized to delete a course to bootcamp ${course._id}`, 404))
        return
    }
    await course.remove()
    res.status(200).json({ success: true, data: {} })
})