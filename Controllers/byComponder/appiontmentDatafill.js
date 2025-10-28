import Appointment from '../../models/patientAppointmentModel.js';
import Patient from '../../models/patientModel.js'; 
import User from '../../xyzModel.js'; 


const AppointmentByComponder = async (req, res) => {
  const { patientId, healthWorkerId, assessment, forwardTo } = req.body;

  if (!patientId || !assessment || !forwardTo || !healthWorkerId) {
    return res.status(400).json({ msg: 'Please provide all required appointment details.' });
  }

  try {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ msg: 'Patient not found.' });
    }

    const healthWorker = await User.findById(healthWorkerId);
    if (!healthWorker) {
      return res.status(404).json({ msg: 'Health worker not found.' });
    }

    const newAppointment = new Appointment({
      patient: patientId,
      healthWorker: healthWorkerId,
      assessment: {
        weight: assessment.weight,
        height: assessment.height,
        bp: assessment.bp,
        pulse: assessment.pulse,
        respiration: assessment.respiration,
        notes: assessment.notes || '',
      },
      forwardTo,
      status: 'Pending Doctor',
    });

    const savedAppointment = await newAppointment.save();

    const formattedAppointment = {
      ...savedAppointment.toObject(),
      patient: {
        _id: patient._id,
        fullName: patient.fullName,
        dob: patient.dob,
        mobile: patient.mobile,
      }
    };

    res.status(201).json({
      msg: 'Appointment created and forwarded successfully.',
      appointment: formattedAppointment
    });

  } catch (err) {
    console.error('Error creating appointment:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Validation error', errors: err.errors });
    }
    res.status(500).send('Server Error');
  }
};

export const todayAppiontemnt = async (req, res) => {
  try {
    console.log('cdc');
    const { healthWorkerId } = req.query;
    console.log(healthWorkerId);
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const appointments = await Appointment.find({
      healthWorker: healthWorkerId,
      createdAt: { $gte: startOfDay, $lt: endOfDay }
    });

    if (!appointments.length){
      return res.status(404).json({ msg: 'No appointments found for today.' });
    }
    const patientIds = appointments.map(app => app.patient);

    const patients = await Patient.find(
      { _id: { $in: patientIds } },
      { fullName: 1, dob: 1, mobile: 1 }
    );

    const patientMap = {};
    patients.forEach(p => {
      patientMap[p._id.toString()] = p;
    });

    const results = appointments.map(app => ({
      ...app.toObject(),
      patient: patientMap[app.patient.toString()] || null
    }));

    res.status(200).json(results);

  } catch (err) {
    console.error("Error fetching today's appointments:", err.message);
    res.status(500).send('Server Error');
  }
};

export default AppointmentByComponder;
