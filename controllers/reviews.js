const Review = require('../models/Review')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');


//@route GET /api/v1/courses
//       GET /api/v1/bootcamps/:bootcampId/reviews
exports.getReviews = asyncHandler(async (req, res, nex) => {
    if (req.params.bootcampId) {
        const reviews = await Review.find({ bootcamp: req.params.bootcampId })
        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        })
    } else {
        res.status(200).json(res.advancedResults)
    }

})


exports.getReview = asyncHandler(async (req, res, next) => {

    const review = await Review.findById(req.params.id).populate({ path: 'bootcamp', select: 'name description' })

    if (!review) {
        next(new ErrorResponse(`No reviews with Id ${res.params.id}`, 404))
        return
    }
    res.status(200).json({ success: true, data: review })
})

//@route POST /api/v1/bootcamps/:bootcampId/reviews
exports.addReview = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)
    if (!bootcamp) {
        next(new ErrorResponse(`No bootcamp with Id ${res.params.bootcampId} exits`, 404))
        return
    }
    const review = await Review.create(req.body)
    res.status(201).json({ success: true, data: review })
})

//@route PUT /api/v1/reviews/:id
exports.updateReview = asyncHandler(async (req, res, next) => {

    let review = await Review.findById(req.params.id)
    if (!review) {
        next(new ErrorResponse(`No review with Id ${req.params.id} exits`, 404))
        return
    }
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        next(new ErrorResponse(`Not Authorized to update review`, 401))
        return
    }
    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    res.status(200).json({ success: true, data: review })
})


//@route DELETE /api/v1/reviews/:id

exports.deleteReview = asyncHandler(async (req, res, next) => {

    const review = await Review.findById(req.params.id)
    if (!review) {
        next(new ErrorResponse(`No review with Id ${req.params.id} exits`, 404))
        return
    }
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        next(new ErrorResponse(`Not Authorized to delete review`, 401))
        return
    }
    await review.remove()
    res.status(200).json({ success: true, data: {} })
})

