import Appointment from '../../models/patientAppointmentModel.js';
import Patient from '../../models/patientModel.js';

const getAppointmentById = async (req, res) => {
  const { id } = req.query;
  try {
    // Find appointment
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found.' });
    }

    // Fetch patient manually 
    let patient = null;
    if (appointment.patient) {
      patient = await Patient.findById(
        appointment.patient,
        { fullName: 1, dob: 1, mobile: 1 } // only return required fields
      );
    }

    // Attach patient info manually
    const result = {
      ...appointment.toObject(),
      patient: patient || null 
    };

    res.status(200).json(result);

  } catch (err) {
    console.error("Error fetching appointment by ID:", err.message);
    res.status(500).send('Server Error');
  }
};

export default getAppointmentById;
