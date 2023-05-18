const hasValidProperties = require('../errors/hasValidProperties')
const hasProperties = require('../errors/hasProperties')

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


module.exports = {
    create: [hasRequiredProperties, hasValidFields]
}