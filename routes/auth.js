const express = require('express')

const { register, login, logout, getMe, forgotPassword, resetPassword, updatedetails, updatePassword } = require('../controllers/auth')
const { protect } = require('../middleware/auth')
const router = express.Router()

router.route('/register').post(register)

router.post('/login', login)
router.get('/logout', logout)
router.get('/me', protect, getMe)
router.post('/forgotPassword', forgotPassword)
router.put('/resetpassword/:resettoken', resetPassword)
router.put('/updatedetails', protect, updatedetails)
router.put('/updatepassword', protect, updatePassword)

module.exports = router;  