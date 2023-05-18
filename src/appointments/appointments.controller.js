const appointmentService = require('./appointments.service')
const asyncErrorBoundary = require('../errors/asyncErrorBoundary')

async function create(req, res){
    const newAppointment = {
        ...req.body.data, 
        status: 'booked'
    };
    const data = await appointmentService.create(newAppointment);
    res.status(201).json({ data });
}

module.exports = {
    create: asyncErrorBoundary(create)
}