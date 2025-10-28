import Appointment from '../../models/patientAppointmentModel.js';
import Patient from '../../models/patientModel.js';

// @desc    Get all appointments with status 'Pending Lab'
// @route   GET /api/dispenser/pending
// @access  Private (for dispensers)
export const getPendingPrescriptions = async (req, res) =>{
  try {
    // Step 1: Get appointments
    const appointments = await Appointment.find({ status: 'Pending Dispenser' }).sort({ createdAt: 1 });

    // Step 2: Manually fetch patients
    const result = await Promise.all(
      appointments.map(async (appt) => {
        let patientData = null;
        if (appt.patient) {
          try {
            patientData = await Patient.findById(appt.patient).select("fullName dob gender mobile address");
          } catch (err) {
            console.warn(`Patient not found for appointment ${appt._id}`);
          }
        }
        return {
          ...appt.toObject(),
          patient: patientData, // attach patient manually
        };
      })
    );

    if (!result || result.length === 0) {
      return res.status(404).json({ msg: 'No pending prescriptions found.' });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching pending prescriptions:", err.message);
    res.status(500).send('Server Error');
  }
};



export const finalizeDispensing = async (req, res) => {
  const { appointmentId } = req.query;
  const { notes, dispensedMedicines } = req.body;


  try {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found.' });
    }
    
    if (appointment.status !== 'Pending Dispenser') {
        return res.status(400).json({ msg: `This appointment has a status of ${appointment.status} and cannot be dispensed.` });
    }

    // Update the appointment with dispenser's data
    appointment.dispenserNotes = notes;
    appointment.dispensedMedicines = dispensedMedicines;
    appointment.status = 'Completed'; // Update status to Completed

    const updatedAppointment = await appointment.save();

    res.status(200).json(updatedAppointment);

  } catch (err) {
    console.error("Error finalizing dispensing:", err.message);
    res.status(500).send('Server Error');
  }
};