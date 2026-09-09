import { useEffect, useState } from 'react';
import { attendeeApi } from '../../services/api.js';
import AttendeeDashboardPage from './AttendeeDashboardPage.jsx';
import RegistrationPage from './RegistrationPage.jsx';

function AttendeePortalPage() {
  const [attendee, setAttendee] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const loadProfile = () => {
    setProfileLoading(true);
    setProfileError('');
    attendeeApi.me().then(({ data }) => setAttendee(data.data.attendee)).catch((requestError) => {
      if (requestError.response?.status !== 404) setProfileError(requestError.response?.data?.message || 'Unable to load attendee profile.');
    }).finally(() => setProfileLoading(false));
  };
  useEffect(() => { Promise.resolve().then(loadProfile); }, []);
  if (profileLoading) return <div className="loading-state">Loading your event pass...</div>;
  if (attendee) return <AttendeeDashboardPage attendee={attendee} onRefresh={loadProfile} />;
  if (profileError) return <div className="workspace"><p className="form-error">{profileError}</p></div>;
  return <RegistrationPage onComplete={setAttendee} />;
}

export default AttendeePortalPage;
