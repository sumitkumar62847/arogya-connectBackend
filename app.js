import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';


import './models/patientModel.js';
import './models/patientAppointmentModel.js';

import {loginWithPassword, mobileOTPVerify} from './Controllers/Patients/login.js'
import Adminlogin, { authLimiter } from './Controllers/Admin/login.js';
import { authenticateToken } from './middlewares/login.js';
import router from './Controllers/Patients/register.js';
import { findPatientByMobile } from './Controllers/byComponder/findPatientByMobile.js';
import FindPatientById from './Controllers/byComponder/patientDetail.js';
import AppointmentByComponder, { todayAppiontemnt } from './Controllers/byComponder/appiontmentDatafill.js';
import getAppointmentByDr from './Controllers/doctor/getAppointmentByDr.js';
import getAppointmentById from './Controllers/doctor/getAppointmentById.js';
import submitDoctorNotes from './Controllers/doctor/postAppointmentData.js';
import { finalizeDispensing, getPendingPrescriptions } from './Controllers/dispenser/updateAppointment.js';
import getPatientAppointments from './Controllers/Patients/getAppointmentById.js';




dotenv.config(); 
const app = express();

const PORT = process.env.SERVER_PORT;

const frontA = process.env.FRONTA;
const frontB = process.env.FRONTB;


app.use(express.json());
app.use(cors({origin: [frontA, frontB]}));

mongoose.connect(process.env.MONGO_URL ,{
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));



// routes ----------> 

app.get('/verifyToken', authenticateToken, (req, res) => {
  console.log(req.user);
  res.status(200).json({ 
    message: 'Token is valid.',
    user: {
      id: req.user.user.id,
      role: req.user.user.role,
    }
  });
});

app.get('/verifyTokenUser', authenticateToken, (req, res) => {
  console.log(req.user);
  res.status(200).json({ 
    message: 'Token is valid.',
    user: {
      id: req.user.id,
      role: req.user.role,
    }
  });
});


app.use('/api', router); 
app.post('/loginAdminScndjhb',authLimiter, Adminlogin);
app.post('/loginUserShdefgbf',loginWithPassword);
app.post('/verifyLoginOtp',mobileOTPVerify);

// ---safe P
app.get('/appointmentbyPId',authenticateToken, getPatientAppointments);



// ---safe A

app.put('/dispenser/dispense',finalizeDispensing);

app.put('/appointments/doctor', submitDoctorNotes);

// -------------

app.post('/api/appointmentsbyComp', AppointmentByComponder);

// --------------

app.get('/dispenser/pending', getPendingPrescriptions);

app.get('/getappointmentbtId',getAppointmentById);//-------

app.get('/doctor/appointments', getAppointmentByDr);

app.get('/appointments/today',todayAppiontemnt);

app.get('/find-patient',findPatientByMobile);

app.get('/api/patientById', FindPatientById);










app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`) 
});