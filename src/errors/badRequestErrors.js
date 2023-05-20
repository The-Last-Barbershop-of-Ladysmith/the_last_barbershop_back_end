/**
 * Contains functions that are to be used during validation
 * 
 * One method creates an array of error message strings.  Should be called before validation
 * 
 * for each validation error add the error message to the error array
 * 
 * Then throw all error messages after all validation methods.  Should be called after validation methods
 * 
 * @example within validation file call create method where you want to start building errors list, then at the end call throw errors method
 * module.exports = {
 *  create: [
 *      createBadRequestErrorsArray, 
 *      // validation methods ...
 *      throwBadRequestErrors
 *  ]
 * }
 */

/**
 * Creates an array of error messages that will be stored in response locals
*/
function createBadRequestErrorsArray(req, res, next){
    res.locals.errors = []
    next()
}

/**
 * Joins the messages in the errors array to be called to next with Bad Request error status
 * next is used in place of sending as a response since the error object will be passed to the error handler when calling next 
 */
function throwBadRequestErrors(req, res, next){
    const { errors } = res.locals
    errors.length
        ? next({status: 400, message: errors.join(', \n& ')})
        : next()
}

module.exports = {
    createBadRequestErrorsArray, throwBadRequestErrors
}