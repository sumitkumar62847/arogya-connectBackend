import Appointment from '../../models/patientAppointmentModel.js';
import Patient from '../../models/patientModel.js';
import mongoose from 'mongoose';

const getPatientAppointments = async (req, res) => {
  const { patientId } = req.query;

  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    return res.status(400).json({ msg: 'Invalid patient ID format.' });
  }

  try {
    // Find the patient to display their details in the header
    const patient = await Patient.findById(patientId);
    if (!patient) {
        return res.status(404).json({ msg: 'Patient not found.' });
    }

    // Find all appointments for that patient, sorted by most recent
    const appointments = await Appointment.find({ patient: patientId })
      .sort({ createdAt: -1 });

    // Combine patient details with their appointments for the response
    res.status(200).json({ patient, appointments });

  } catch (err) {
    console.error("Error fetching patient appointments:", err.message);
    res.status(500).send('Server Error');
  }
};

export default getPatientAppointments;