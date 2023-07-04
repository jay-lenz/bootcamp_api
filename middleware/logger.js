//custom middleware
const logger = (req, res, next)=>{
    console.log(`Middleware ran ${req.method} ${req.protocol} ${req.get('host')}  ${req.originalUrl}`)
    next();
}

module.exports = logger