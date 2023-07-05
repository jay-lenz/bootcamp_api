const advancedResults = (model, populate) => async (req, res, next) => {
    let query;


    let reqQuery = { ...req.query };

    let queryString = JSON.stringify(reqQuery)

    const removeField = ['select', 'sort', 'page', 'limit']

    removeField.forEach(x => delete reqQuery[x])
    // console.log(reqQuery)
    // let queryString = JSON.stringify(req.query)

    //create operators for greater than $gt, lessthan $lt, etc 
    queryString = queryString.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)
    // console.log('filter : \n ', queryString)

    //finding resource
    query = model.find(JSON.parse(queryString))

    //select fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields)
        // console.log(fields)
    }
    //sort 
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ')
        query = query.sort(sortBy)
    } else {
        query = query.sort('-createdAt')
    }

    //populate 
    if (populate) {
        query = query.populate(populate)
    }
    //pagination
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 7) || 7
    const startIndex = (page - 1) * limit
    const endIndex = page * limit;
    const total = await model.countDocuments()
    query = query.skip(startIndex).limit(limit)

    //pagination result 
    const pagination = {}
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }
    //executin query
    const results = await query;
    // console.log(results)
    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }

    next()
}

module.exports = advancedResults