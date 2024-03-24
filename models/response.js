const response = (res, responseStatus, responseMessage, responseData = null) => {
    let success;
    if(responseStatus >= 200 && responseStatus <= 299) {
        success = true;
    } else {
        success = false;
    }
    return res.status(responseStatus).json({
        error: (success ? false: true),
        data: responseData,
        message: responseMessage
    });
}

module.exports = {
    response
}