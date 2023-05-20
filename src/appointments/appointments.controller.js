const appointmentService = require('./appointments.service')
const asyncErrorBoundary = require('../errors/asyncErrorBoundary')
const { STATUS: APPT_STATUS } = require('../utils/string-constants').APPOINTMENTS

async function create(req, res){
    const newAppointment = {
        ...req.body.data, 
        status: APPT_STATUS.BOOKED
    };
    const data = await appointmentService.create(newAppointment);
    res.status(201).json({ data });
}

module.exports = {
    create: asyncErrorBoundary(create)
}