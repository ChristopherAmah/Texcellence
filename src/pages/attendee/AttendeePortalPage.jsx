import { useState } from 'react';
import AttendeeDashboardPage from './AttendeeDashboardPage.jsx';
import RegistrationPage from './RegistrationPage.jsx';

function AttendeePortalPage() {
  const [attendee, setAttendee] = useState(null);
  if (attendee) return <AttendeeDashboardPage attendee={attendee} />;
  return <RegistrationPage onComplete={setAttendee} />;
}

export default AttendeePortalPage;
