const express = require('express')

const router = express.Router({ mergeParams: true })

const { getReviews, getReview, addReview, updateReview, deleteReview } = require('../controllers/reviews')

const Review = require('../models/Review')
const advancedResults = require('../middleware/advancedResult')
const { protect, authorize } = require('../middleware/auth')


router.route('/')
    .get(advancedResults(Review, {
        path: 'bootcamp',
        select: 'name description housing'
    }), getReviews).post(protect, authorize('user', 'admin'), addReview)


router.route('/:id').get(getReview)
    .post(protect, authorize('user', 'admin'), addReview)
    .put(protect, authorize('user', 'admin'), updateReview)
    .delete(protect, authorize('user', 'admin'), deleteReview)

module.exports = router

