const error = (errorStatus, errorMessage) => {
    return {
        success: false,
        errorStatus: errorStatus,
        message: errorMessage
    }
}

module.exports = {
    error,
}