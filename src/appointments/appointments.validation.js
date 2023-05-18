const hasValidProperties = require('../errors/hasValidProperties')
const hasProperties = require('../errors/hasProperties')
const stringConstants = require('../utils/string-constants')

const VALID_PROPERTIES = [ 
    "first_name",
    "last_name",
    "mobile_number",
    "appointment_date",
    "appointment_time",
    "people",
    "status",
    "updated_at",
    "created_at",
]

const REQUIRED_PROPERTIES = [
    "first_name",
    "last_name",
    "mobile_number",
    "appointment_date",
    "appointment_time",
    "people",
]

const hasRequiredProperties = hasProperties(REQUIRED_PROPERTIES)
const hasValidFields = hasValidProperties(VALID_PROPERTIES)

function validateMobileNumberFormat(req, res, next){
    const { data : { mobile_number} } = req.body
    const mobileNumberRegEx = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/
    const formatIsValid = mobileNumberRegEx.test(mobile_number)
    formatIsValid 
        ? next()
        : next({ status: 400, message: stringConstants.INVALID_MOBILE_NUMBER})
}

function validateDateFormat(req, res, next){
    const { data: { appointment_date} } = req.body
    const dateRegEx = /^[2-9]{1}\d{3}-(0[1-9]||1[0-2])-([0-2]{1}[0-9]{1}|3[0-1]{1})$/
    const formatIsValid = dateRegEx.test(appointment_date)
    formatIsValid
        ? next()
        : next({ status: 400, message: stringConstants.INVALID_DATE})
}


module.exports = {
    create: [hasRequiredProperties, hasValidFields, validateMobileNumberFormat, validateDateFormat]
}