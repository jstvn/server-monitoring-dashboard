import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navPillClassName = ({ isActive }) =>
  `ui-nav-pill ${isActive ? 'ui-nav-pill-active' : 'ui-nav-pill-inactive'}`;

const navPillOutlineClassName = ({ isActive }) =>
  `ui-nav-pill ${isActive ? 'ui-nav-pill-active' : 'ui-nav-pill-outline'}`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/70 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 text-sm font-semibold text-white shadow-lg shadow-slate-900/20">
            S
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight text-slate-900">Server Monitoring</div>
            <div className="text-xs font-medium text-slate-500">Operations dashboard</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NavLink to="/dashboard" className={navPillClassName}>
                Dashboard
              </NavLink>
              <NavLink to="/profile" className={navPillClassName}>
                Profile
              </NavLink>
              <button onClick={handleLogout} className="ui-btn-ghost">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navPillClassName}>
                Login
              </NavLink>
              <NavLink to="/register" className={navPillOutlineClassName}>
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
