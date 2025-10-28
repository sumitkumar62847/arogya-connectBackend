
import Patient from '../../models/patientModel.js'; 


const FindPatientById =  async (req, res) => {
  console.log('cdscds');
    const {patientId } = req.query;
    console.log('cdscds');

  try {
    
    const patient = await Patient.findById(patientId);
    console.log(patient);
    if (!patient) {
      return res.status(404).json({ msg: 'Patient not found.' });
    }

    res.status(200).json(patient);

  } catch (err) {
    console.error('Error fetching patient by ID:', err.message);
    res.status(500).send('Server Error');
  }
}

export default FindPatientById;