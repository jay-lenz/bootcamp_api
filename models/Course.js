const mongoose = require('mongoose')

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'course title is required'],

    },
    description: {
        type: String,
        required: [true, 'description is required']
    },
    weeks: {
        type: String,
        required: [true, 'please add number of weeks']
    },
    tuition: {
        type: Number,
        required: [true, 'please add a tuition cost']
    },
    minimumSkill: {
        type: String,
        required: [true, 'please add a miminum skill'],
        enum: ['beginner', 'intermediate', 'advanced']
    },
    scholarhipsAvailable: {
        type: Boolean,
        default: false
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

//static method 
CourseSchema.statics.getAverageCost = async function (bootcampId) {
    console.log(`calculating average cose`.yellow.inverse)

    const obj = await this.aggregate(
        [{
            $match: { bootcamp: bootcampId }
        },
        {
            $group: {
                _id: '$bootcamp',
                avarageCost: { $avg: '$tuition' }
            }
        }])
    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageCost: Math.ceil(obj[0].avarageCost / 10) * 10
        })
    } catch (error) {
        console.log(error)
    }
}

//call get averagecost after save and delete
CourseSchema.post('save', function (next) {
    this.constructor.getAverageCost(this.bootcamp)
})

CourseSchema.pre('remove', function (next) {
    this.constructor.getAverageCost(this.bootcamp)
})
module.exports = mongoose.model('Course', CourseSchema)