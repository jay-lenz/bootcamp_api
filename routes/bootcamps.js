const express = require('express')

const { getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload } = require('../controllers/bootcamps')

//include other resource router
const courseRouter = require('./courses')
const reviewRouter = require('./reviews')


// const populate = { path: 'courses', select: 'title' }
const Bootcamp = require('../models/Bootcamp')
const Course = require('../models/Course')
const advancedResults = require('../middleware/advancedResult')

const { protect, authorize } = require('../middleware/auth')

const router = express.Router();
//reroute into other resource route
router.use('/:bootcampId/courses', courseRouter)
router.use('/:bootcampId/reviews', reviewRouter)

router
    .route('/')
    .get(advancedResults(Bootcamp, { path: 'courses', select: 'title' }), getBootcamps)
    .post(protect, authorize('publisher', 'admin'), createBootcamp);

router
    .route('/:id')
    .get(getBootcamp)
    .put(protect, authorize('publisher', 'admin'), updateBootcamp)
    .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

router.route('/radius/:zipcode/:distance')
    .get(getBootcampsInRadius)

router.route('/:id/photo')
    .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload)



// router.get('/', (req, res)=>{
//     res.status(200).json({success : true,
//         messgae : 'show all bootcamps', 
//        })
// })
// router.get('/:id', (req, res)=>{
//     res.status(200).json({success : true,
//         messgae : `'get bootcamp' ${req.params.id}`, 
//        })
// })

// router.post('/', (req, res)=>{
//     res.status(200).json({success : true,
//         messgae : 'post bootcamps', 
//        })
// })

// router.put('/:id', (req, res)=>{
//     res.status(200).json({success : true,
//         messgae : `'update bootcamps' ${req.params.id}`, 
//        })
// })

// router.delete('/:id', (req, res)=>{
//     res.status(200).json({success : true,
//         messgae : `delete bootcamps ${req.params.id}`, 
//        })
// })

module.exports = router;