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


module.exports = {
    create: [hasRequiredProperties, hasValidFields, validateMobileNumberFormat]
}