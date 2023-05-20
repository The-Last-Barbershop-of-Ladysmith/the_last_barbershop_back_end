const hasValidProperties = require('../errors/hasValidProperties')
const hasProperties = require('../errors/hasProperties')
const { createBadRequestErrorsArray, throwBadRequestErrors} = require('../errors/badRequestErrors')
const {
    REGEX: APPT_REGEX, ERRORS: APPT_ERRORS, VALID_PROPERTIES, REQUIRED_PROPERTIES
} = require('../utils/string-constants').APPOINTMENTS

/**
 * Checks request body has all required appointment fields
 */
const hasRequiredProperties = hasProperties(REQUIRED_PROPERTIES)

/**
 * Checks request body only has valid fields of an appointment instance
 */
const hasValidFields = hasValidProperties(VALID_PROPERTIES)

/**
 * Checks the mobile number of the request body follows correct string format of 555-555-5555
 */
function validateMobileNumberFormat(req, res, next){
    const { data : { mobile_number} } = req.body
    const formatIsValid = APPT_REGEX.PHONE.test(mobile_number)
    if (!formatIsValid) res.locals.errors.push(APPT_ERRORS.INVALID_MOBILE_NUMBER) 
    next()
}

/**
 * Checks the appointment date is a valid date in format MM/YY
 */
function validateDateFormat(req, res, next){
    const { data: { appointment_date} } = req.body
    const formatIsValid = APPT_REGEX.DATE.test(appointment_date)
    if (!formatIsValid) res.locals.errors.push(APPT_ERRORS.INVALID_DATE)
    next()
}

/**
 * Checks the appointment time is a valid time in format HH:MM
 */
function validateTimeFormat(req, res, next){
    const { data: { appointment_time } } = req.body
    const formatIsValid = APPT_REGEX.TIME.test(appointment_time)
    if (!formatIsValid) res.locals.errors.push(APPT_ERRORS.INVALID_TIME)
    next()
}

/**
 * Checks that number of people in the appointment is an integer
 */
function validatePeopleIsANumber(req, res, next){
    const { data: { people }} = req.body
    const peopeIsNumber = Number.isInteger(people)
    if (!peopeIsNumber) res.locals.errors.push(APPT_ERRORS.PEOPLE_INVALID)
    next()
}

module.exports = {
    create: [
        createBadRequestErrorsArray,
        hasRequiredProperties, 
        hasValidFields, 
        validateMobileNumberFormat, 
        validateDateFormat, 
        validateTimeFormat, 
        validatePeopleIsANumber,
        throwBadRequestErrors
    ]
}