import { LogOut } from 'lucide-react';
import logo from '../../assets/texcellence_logo.png';

function AppShell({ user, logout, children }) {
  return <main className="app-shell dashboard-shell"><header className="topbar"><img className="app-logo" src={logo} alt="The TeXcellence Conference" /><div className="user-menu"><span>{user.firstName} {user.lastName}</span><button className="icon-button" onClick={logout} title="Sign out" aria-label="Sign out"><LogOut size={18} /></button></div></header>{children}</main>;
}

export default AppShell;
