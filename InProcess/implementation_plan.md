# Video Consultation Feature

Adding the capability for users to select either an Offline or Video consultation when booking an appointment. For now, both are free.

## User Review Required

> [!IMPORTANT]
> To support Video Consultations without requiring complex API integrations, this plan utilizes **Jitsi Meet**. Jitsi provides free, open-source video meetings that can be embedded or linked directly. A unique meeting link will be generated and saved for each video appointment. Users and doctors will simply click a "Join Video Call" button to join the meeting in a new tab. Please let me know if you would prefer a different video provider.

## Proposed Changes

### Backend

#### [MODIFY] [appointmentModel.js](file:///c:/Webdev/hms-fullstack-main/backend/model/appointmentModel.js)
- Add `consultationType` (String, default: "Offline").
- Add `meetLink` (String, default: "").

#### [MODIFY] [userController.js](file:///c:/Webdev/hms-fullstack-main/backend/controllers/userController.js)
- Update `bookAppointment` to accept `consultationType`.
- If `consultationType` is "Video", generate a unique Jitsi meet link (e.g., `https://meet.jit.si/HMS_...`) and save it to the appointment document.

---

### Frontend (User)

#### [MODIFY] [Appointments.jsx](file:///c:/Webdev/hms-fullstack-main/frontend/src/pages/Appointments.jsx)
- Add a UI section to allow the user to select the consultation type (Offline or Video) prior to clicking "Book an Appointment".
- Pass the selected `consultationType` in the `bookAppointment` API request.

#### [MODIFY] [MyAppointments.jsx](file:///c:/Webdev/hms-fullstack-main/frontend/src/pages/MyAppointments.jsx)
- Display the `consultationType` on each appointment card.
- If the type is "Video" and the appointment is not cancelled, show a "Join Video Call" button that opens the `meetLink` in a new tab.

---

### Admin / Doctor

#### [MODIFY] [AllAppointments.jsx](file:///c:/Webdev/hms-fullstack-main/admin/src/pages/Admin/AllAppointments.jsx)
- Display the `consultationType` in the appointment list/table.

#### [MODIFY] [DoctorAppointments.jsx](file:///c:/Webdev/hms-fullstack-main/admin/src/pages/Doctor/DoctorAppointments.jsx)
- Display the `consultationType`.
- If the appointment is "Video" and not cancelled, provide a "Join Video Call" action button for the doctor to join the meeting.

## Verification Plan

### Automated/Manual Verification
- Book a new Video appointment on the frontend and verify it is successful.
- Check the User's "My Appointments" page to ensure the "Join Video Call" button appears and functions.
- Check the Doctor's "Appointments" page to ensure the video call link is available.
- Check the Admin's "All Appointments" page to verify `consultationType` is visible.
