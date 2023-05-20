const constants = {
    APPOINTMENTS: {
        TABLE_NAME: 'appointments',
        VALID_PROPERTIES: [ 
            "first_name",
            "last_name",
            "mobile_number",
            "appointment_date",
            "appointment_time",
            "people",
            "status",
            "updated_at",
            "created_at",
        ],
        REQUIRED_PROPERTIES: [
            "first_name",
            "last_name",
            "mobile_number",
            "appointment_date",
            "appointment_time",
            "people",
        ],
        STATUS: {
            BOOKED: 'booked',
            COMPLETED: 'completed',
            CANCELED: 'canceled'
        },
        REGEX: {
            PHONE: /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/,
            DATE: /^[2-9]{1}\d{3}-(0[1-9]||1[0-2])-([0-2]{1}[0-9]{1}|3[0-1]{1})$/,
            TIME: /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/
        },
        ERRORS: {
            INVALID_MOBILE_NUMBER: 'mobile_number must be in format 555-555-5555',
            INVALID_DATE: 'appointment_date must be in format YYYY-MM-DD',
            INVALID_TIME: 'appointment_time must be in format HH:MM',
            PEOPLE_INVALID: 'people must be a number'
        }
    }
}

module.exports = constants