import Patient from '../../models/patientModel.js';

export const findPatientByMobile = async (req, res) => {
  try {
    const { mobileNumber } = req.query;

    if (!mobileNumber) {
      return res.status(400).json({ msg: 'Mobile number is required.' });
    }

    const patient = await Patient.findOne(
      { $or: [{ mobile: mobileNumber }, { mobile: Number(mobileNumber) }] },
      { fullName: 1, dob: 1 } 
    );

    if (!patient) {
      return res.status(404).json({ msg: 'Patient not found.' }); 
    }

    res.status(200).json(patient);

  } catch (error) {
    console.error('Error finding patient:', error.message);
    res.status(500).send('Server Error');
  }
};
