const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'please add title for review'],
        maxlength: 100

    },
    text: {
        type: String,
        required: [true, 'please add some text']
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, ' please add rating between 1 and 10']
    },

    createdAt: {
        type: Date,
        default: Date.Now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
})
//allows user have only one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true })

//static methog to get average rating
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
    console.log(`calculating average rating`.yellow.inverse)

    const obj = await this.aggregate(
        [{
            $match: { bootcamp: bootcampId }
        },
        {
            $group: {
                _id: '$bootcamp',
                avarageRating: { $avg: '$rating' }
            }
        }])
    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageRating: Math.ceil(obj[0].avarageRating)
        })
    } catch (error) {
        console.log(error)
    }
}

//call getAverageRating after save and delete
ReviewSchema.post('save', function (next) {
    this.constructor.getAverageRating(this.bootcamp)
})

ReviewSchema.post('remove', function (next) {
    this.constructor.getAverageRating(this.bootcamp)
})
module.exports = mongoose.model('Review', ReviewSchema) 