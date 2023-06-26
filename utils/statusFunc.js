module.exports = (res, status, message) => {
    return res.json({
        status, 
        message
    })
}