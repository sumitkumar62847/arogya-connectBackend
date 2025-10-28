import Appointment from '../../models/patientAppointmentModel.js';

const submitDoctorNotes = async (req, res) => {
  const { id } = req.query; // Get appointment ID from URL
  const { diagnosis, notes, labTests, prescriptions } = req.body;


  if (!diagnosis){
    return res.status(400).json({ msg: 'Diagnosis is a required field.' });
  }

  try {
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found.' });
    }

    // Determine the next status
    let nextStatus = 'Completed';
    if (prescriptions && prescriptions.length > 0) {
      nextStatus = 'Pending Dispenser';
    }

    // Update the appointment document
    appointment.doctorNotes = {
      diagnosis,
      notes,
      labTests,
      prescriptions,
    };
    appointment.status = nextStatus;

    const updatedAppointment = await appointment.save();

    res.status(200).json(updatedAppointment);

  } catch (err) {
    console.error("Error submitting doctor's notes:", err.message);
    res.status(500).send('Server Error');
  }
};

export default submitDoctorNotes;