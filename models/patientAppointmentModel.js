import mongoose from 'mongoose';
const Schema = mongoose.Schema;


const AssessmentSchema = new Schema({
  weight: { type: String },
  height: { type: String },
  bp: { type: String, trim: true },
  pulse: { type: String },
  respiration: { type: String },
  notes: { type: String, trim: true }
}, { _id: false });

const PrescriptionSchema = new Schema({
  name: { type: String, required: true, trim: true },
  dosage: { type: String, trim: true },
  freq: { type: String, trim: true } 
}, { _id: false });

const DoctorNotesSchema = new Schema({
  diagnosis: { type: String, required: true, trim: true },
  notes: { type: String, trim: true },
  labTests: [{ type: String, trim: true }],
  prescriptions: [PrescriptionSchema]
}, { _id: false });


const AppointmentSchema = new Schema({
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'patientbyselves',
    required: true,
    index: true
  },
  healthWorker: {
    type: Schema.Types.ObjectId,
    ref: 'allworkers',
    required: true
  },
  forwardTo: {
    type: String,
    required: true,
    trim: true
  },
  assessment: {
    type: AssessmentSchema
  },
  doctorNotes: {
    type: DoctorNotesSchema
  },
  dispenserNotes: {
    type: String,
    trim: true
  },
  dispensedMedicines: [PrescriptionSchema],
  status: {
    type: String,
    required: true,
    enum: ['Pending Doctor', 'Pending Lab', 'Pending Dispenser', 'Completed', 'Cancelled'],
    default: 'Pending Doctor'
  }
}, {
  timestamps: true
});

const Appointment = mongoose.model('Appointment', AppointmentSchema);
export default Appointment;
