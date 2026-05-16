# Video Consultation Feature Implementation

The video consultation feature has been fully implemented, allowing users to choose between an offline visit and a video call when booking an appointment.

## Summary of Changes

### Backend Updates
- **`appointmentModel.js`**: Added `consultationType` (defaults to "Offline") and `meetLink`.
- **`userController.js`**: Updated the `bookAppointment` logic. If a user selects "Video" for their `consultationType`, a unique **Jitsi Meet** link is generated for the session and securely stored in the appointment record.

### User Frontend
- **Booking Flow (`Appointments.jsx`)**: Added radio buttons to select "Offline" or "Video Call" prior to booking. The choice is sent to the backend.
- **My Appointments (`MyAppointments.jsx`)**: Appointment cards now display the consultation type. For video calls that are neither cancelled nor completed, a prominent **Join Video Call** button is provided. Clicking it opens the meeting in a new tab.

### Admin and Doctor Dashboard
- **Admin Appointments (`AllAppointments.jsx`)**: Added a "Type" column to the data table so administrators can clearly see whether an appointment is Offline or a Video Call.
- **Doctor Appointments (`DoctorAppointments.jsx`)**: Displayed the consultation type. For active video appointments, a quick **Join** button is available, allowing the doctor to jump directly into the session with the patient.

## Verification
All the new UI elements display conditionally based on the appointment state, preventing users or doctors from joining cancelled or completed calls. The Jitsi Meet link functionality does not require authentication from either party, streamlining the connection process.
