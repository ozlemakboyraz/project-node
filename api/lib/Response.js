const Enum = require('../config/Enum');
const CustomError = require('../lib/Error');

class Response {

    constructor() { }
    static successResponse(data, code = 200) {
        return {
            code,
            data
        }
    }

    static errorResponse(error) {
        if (error instanceof CustomError) {
            return {
                code: error.code,
                error:{
                    message: error.message,
                    description: error.description
                }
            }
        } else if(error.message.includes("E11000")) {
            return {
                code: Enum.HTTP_STATUS_CODES.CONFLICT,
                error:{
                    message: "Already exists",
                    description: "Already exists"
                }
            }
        }

        return {
            code: Enum.HTTP_STATUS_CODES.SERVER_ERROR,
            error:{
                message: "Unknown Error",
                description: error.message
            }
        }
    }
}

module.exports = Response;