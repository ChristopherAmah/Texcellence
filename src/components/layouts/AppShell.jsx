import { LogOut } from 'lucide-react';

function AppShell({ user, logout, children }) {
  return <main className="app-shell dashboard-shell"><header className="topbar"><span className="wordmark dark-mark">TEX<span>CELLENCE</span></span><div className="user-menu"><span>{user.firstName} {user.lastName}</span><button className="icon-button" onClick={logout} title="Sign out" aria-label="Sign out"><LogOut size={18} /></button></div></header>{children}</main>;
}

export default AppShell;
