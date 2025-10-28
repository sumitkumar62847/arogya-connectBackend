import Appointment from '../../models/patientAppointmentModel.js';
import Patient from '../../models/patientModel.js';

const getAppointmentByDr = async (req, res) => {
  const { doctorName } = req.query;

  if (!doctorName) {
    return res.status(400).json({ msg: 'Doctor name is required.' });
  }

  try {
    
    const appointments = await Appointment.find({ forwardTo: doctorName }).sort({ createdAt: -1 });

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ msg: 'No appointments found for this doctor.' });
    }

    const patientIds = appointments.map(app => app.patient);

    // Fetch patients in one query
    const patients = await Patient.find(
      { _id: { $in: patientIds } },
      { fullName: 1, dob: 1, mobile: 1 } // select only needed fields
    );

    // Convert patient array to map for faster lookup
    const patientMap = {};
    patients.forEach(p => { patientMap[p._id] = p; });

    // Attach patient details manually
    const results = appointments.map(app => ({
      ...app.toObject(),
      patient: patientMap[app.patient] || null
    }));

    res.status(200).json(results);

  } catch (err) {
    console.error("Error fetching doctor's appointments:", err.message);
    res.status(500).send('Server Error');
  }
};

export default getAppointmentByDr;
