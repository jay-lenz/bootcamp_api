
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const User = require('../models/User')

//@access Private/Admin
//@route GET /api/v1/users 
exports.getAll = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults)
})


//@access Private/Admin
//@route GET /api/v1/users/:id
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id)
    console.log(req.params)
    res.status(200).json({
        success: true,
        date: user
    })
})

//@access Private/Admin
//@route POST /api/v1/users
exports.createUser = asyncHandler(async (req, res, next) => {

    const user = await User.create(req.body)

    res.status(201).json({
        success: true,
        date: user
    })
})

//@access Private/Admin
//@route PUT /api/v1/users/:id
exports.updateUser = asyncHandler(async (req, res, next) => {

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    // console.log(user)
    res.status(200).json({
        success: true,
        data: user
    })
})

//@access Private/Admin
//@route PUT /api/v1/users/:id
exports.deleteUser = asyncHandler(async (req, res, next) => {

    await User.findByIdAndDelete(req.params.Id)

    res.status(200).json({
        success: true,
        date: '{}done'
    })
})