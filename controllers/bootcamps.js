const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder')
const path = require('path')

//@route GET /api/v1/bootcamps 
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults)

})
//@route GET /api/v1/bootcamps/:id

exports.getBootcamp = asyncHandler(async (req, res, next) => {

    const removefield = ['select', 'sort', 'limit', 'page']
    let quey;
    let reqQuery = JSON.stringify(req.query)
    query = Bootcamp.findById(req.params.id)
    if (req.query.select) {

    }
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        // res.status(400).json({
        //     success: false,
        //     Error: 'Bootcamp no de our db'
        // })
        next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))

        return
    }
    res.status(200).json({
        success: true,
        data: bootcamp
    })
})

//@route POST /api/v1/bootcamps/

exports.createBootcamp = asyncHandler(async (req, res, next) => {
    //add user to req.boy
    req.body.user = req.user.id
    //check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

    //if user isnt admin, they can only add 1 bootcamp
    if (publishedBootcamp && req.user.role !== 'admin') {
        return next(new ErrorResponse(`The user with Id:-> ${req.user.id} has already published a bootcamp`, 400))
    }

    const bootcamp = await Bootcamp.create(req.body)
    res.status(201).json({ success: true, data: bootcamp })

});

//@route PUT /api/v1/bootcamps/:id

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    let bootcamp = await Bootcamp.findById(req.params.id)
    if (!bootcamp) {
        next(new ErrorResponse(`Bootcamp with id ${req.params.id} no de db`, 404))
        return
    }
    //verify ownership
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized `, 401))
    }
    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    res.status(200).json({
        success: true,
        data: bootcamp
    })

})

//@route DELTE /api/v1/bootcamps/:id
exports.deleteBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findById(req.params.id)

        if (!bootcamp) {
            next(new ErrorResponse(`Bootcamp with id ${req.params.id} no de db`, 404))

            return
        }
        if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse(`User ${req.user.id} is not authorized `, 401))
        }
        bootcamp.remove()

        res.status(200).json({
            success: true,
            data: {}
        })

    } catch (err) {
        next(err)

    }
}

//GET bootcamp withing a radius 
//@route get /api/v1/bootcamps/radius/:ripcode/:distance
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    //get lang and long from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    //calculate radius using radian...Divide dist by radius of earth
    //earth radius = 3,963m / 6,378km

    const radius = distance / 3963;
    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    })

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    })

})

//upload pictutre
//@route api/v1/bootcamps/:id/photo

exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    // console.log('Something ')

    const bootcamp = await Bootcamp.findById(req.params.id)
    // console.log(`Bootcamp \n: ${bootcamp}`)
    if (!bootcamp) {
        next(new ErrorResponse(`Bootcamp with id ${req.params.id} no de db`, 404))

        return
    }
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized `, 401))
    }
    if (!req.files) {
        next(new ErrorResponse(`Please upload file`, 404))

        return
    }
    // console.log(`Files \n: ${req.files}`, req.files)

    // const file = req.files
    const file = req.files[Object.keys(req.files)[0]]
    console.log(req.files[Object.keys(req.files)[0]])

    // console.log(typeof file)
    if (!file.mimetype.startsWith('image')) {
        next(new ErrorResponse(`Please upload an image file`, 400))
        return
    }

    if (file.size > process.env.MAX_FILE_UPLOAD) {
        next(new ErrorResponse(`please upload an image less than 1mb`, 400))
        return
    }

    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            return next(new ErrorResponse('problem with file upload', 500))
        }
    })
    console.log(file.name)

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name })
    res.status(200).json({
        success: true,
        data: file.name
    })


})
