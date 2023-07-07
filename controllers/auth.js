const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const User = require('../models/User')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body
    const user = await User.create({
        name,
        email,
        password,
        role
    })
    //creat toekn
    // const token = user.getSignedJwtToken()
    // res.status(200).json({ success: true, token })
    sendTokenResponse(user, 200, res)

})

exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body
    if (!email || !password) {
        next(new ErrorResponse(`Please provide an email and password`, 404))
        return
    }
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorResponse(`Invalid credentials`, 401))
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return next(new ErrorResponse(`invalid credentials`, 401))
    }


    // const token = user.getSignedJwtToken()
    // res.status(200).json({ succesbs: true, token })

    sendTokenResponse(user, 200, res)
})


//@route Post api/v1/auth/me
exports.getMe = asyncHandler(async (req, res, next) => {
    // console.log(req.user)
    const user = await User.findById(req.user.id)
    res.status(200).json({
        success: true,
        data: user
    })
})

//@route get api/v1/auth/logout
exports.logout = asyncHandler(async (req, res, next) => {
    // console.log(req.user)
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        data: {}
    })
})
//@route PUT api/v1/auth/updatedetails
exports.updatedetails = asyncHandler(async (req, res, next) => {
    // console.log(req.user)
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    }
    if (!fieldsToUpdate) {
        return next(new ErrorResponse(`Enter credentials to update`, 401))
    }
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    })
    res.status(200).json({
        success: true,
        data: user
    })
})

//@route PUT api/v1/auth/updatePassword
exports.updatePassword = asyncHandler(async (req, res, next) => {
    // console.log(req.user)
    const user = await User.findById(req.user.id).select('+password')

    //check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse(`Password is incorrect`, 401))
    }
    user.password = req.body.newPassword
    await user.save()

    sendTokenResponse(user, 200, res)


})

//@route Post api/v1/auth/forgotPassword
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
        return next(new ErrorResponse(`No user with that email`, 404))
    }

    //get reset token 
    const resetToken = user.getResetPasswordToken()
    await user.save({ validateBeforeSave: false })
    // console.log(resetToken) 
    //createa reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`
    const message = `You are receiving this email because you requested a password reset. please make a request to \n\n${resetUrl} `;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password  Reset Token',
            message
        })
        res.status(200).json({
            success: true,
            data: "Email sent"
        })
    } catch (error) {
        console.log(error)
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({ validateBeforeSave: false })
        return next(new ErrorResponse(`Email could not be sent ${error.message}`, 500))

    }
    // res.status(200).json({
    //     success: true,
    //     data: user
    // })
})

//@route Post api/v1/auth/resetpassword/:resetToken
exports.resetPassword = asyncHandler(async (req, res, next) => {
    //get hashed token 
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex')
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } })

    if (!user) {
        return next(new ErrorResponse('Invalid Token', 400))
    }
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save();
    sendTokenResponse(user, 200, res)

})
//Get token from modl create cookie and send response

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        })
}