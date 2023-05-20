const hasValidProperties = require('../errors/hasValidProperties')
const hasProperties = require('../errors/hasProperties')
const {
    REGEX: APPT_REGEX, ERRORS: APPT_ERRORS, VALID_PROPERTIES, REQUIRED_PROPERTIES
} = require('../utils/string-constants').APPOINTMENTS

const hasRequiredProperties = hasProperties(REQUIRED_PROPERTIES)
const hasValidFields = hasValidProperties(VALID_PROPERTIES)

function validateMobileNumberFormat(req, res, next){
    const { data : { mobile_number} } = req.body
    const formatIsValid = APPT_REGEX.PHONE.test(mobile_number)
    formatIsValid 
        ? next()
        : next({ status: 400, message: APPT_ERRORS.INVALID_MOBILE_NUMBER })
}

function validateDateFormat(req, res, next){
    const { data: { appointment_date} } = req.body
    const formatIsValid = APPT_REGEX.DATE.test(appointment_date)
    formatIsValid
        ? next()
        : next({ status: 400, message: APPT_ERRORS.INVALID_DATE })
}

function validateTimeFormat(req, res, next){
    const { data: { appointment_time } } = req.body
    const formatIsValid = APPT_REGEX.TIME.test(appointment_time)
    formatIsValid
        ? next()
        : next({ status: 400, message: APPT_ERRORS.INVALID_TIME })
}

function validatePeopleIsANumber(req, res, next){
    const { data: { people }} = req.body
    const peopeIsNumber = Number.isInteger(people)
    peopeIsNumber
        ? next()
        : next({ status: 400, message: APPT_ERRORS.PEOPLE_INVALID })
}

module.exports = {
    create: [
        hasRequiredProperties, 
        hasValidFields, 
        validateMobileNumberFormat, 
        validateDateFormat, 
        validateTimeFormat, 
        validatePeopleIsANumber
    ]
}