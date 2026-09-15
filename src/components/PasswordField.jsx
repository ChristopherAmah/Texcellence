import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

function PasswordField({ value, onChange, required, minLength, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return <div className="password-field">
    <input type={visible ? 'text' : 'password'} required={required} minLength={minLength} autoComplete={autoComplete} value={value} onChange={onChange} />
    <button type="button" className="password-toggle" tabIndex={-1} onClick={() => setVisible((current) => !current)} aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button>
  </div>;
}

export default PasswordField;
