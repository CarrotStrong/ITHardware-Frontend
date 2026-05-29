import { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
// DODANO: CircleHelp
import { PlusCircle, Clock, LogOut, Package, ChartNoAxesCombined, Moon, Sun, CircleHelp } from 'lucide-react';
import logo2 from "../../assets/logo2.svg";
import logo4 from "../../assets/logo4.svg";
import logoSmall from "../../assets/logo-small.png"; 
import { authFetch } from '../../api'; 
// DODANO: Import nowego modala (upewnij się, że ścieżka jest poprawna!)
import AdminHelpModal from '../../components/AdminHelpModal';

export default function AdminLayout() {
  const [hasPendingReservations, setHasPendingReservations] = useState(false);
  // DODANO: Stan dla Modala Pomocy
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('appTheme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('appTheme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    window.location.href = '/';
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center h-12 w-full rounded-xl transition-all duration-300 font-bold text-sm relative overflow-hidden group/navitem ${
      isActive 
        ? 'bg-appPrimary text-white shadow-md shadow-appPrimary/20' 
        : 'text-appMuted hover:bg-appInputBg hover:text-appText'
    }`;

  useEffect(() => {
    const checkPending = async () => {
      try {
        const res = await authFetch('/reservations/admin-list');
        if (res && res.ok) {
          const data = await res.json();
          const pendingCount = Array.isArray(data) ? data.filter(r => r.status === 'pending').length : 0;
          setHasPendingReservations(pendingCount > 0);
        }
      } catch (err) {
        console.error('Nie udało się sprawdzić powiadomień', err);
      }
    };

    checkPending();
  }, []);

  return (
    <div className="min-h-screen bg-appBg text-appText flex font-sans transition-colors duration-300">
      <aside className="group fixed top-0 left-0 h-full w-20 hover:w-64 bg-appCard border-r border-appBorder z-50 flex flex-col justify-between p-4 transition-all duration-300 ease-in-out hover:shadow-2xl">
        <div>
          <div className="relative h-16 mb-8 flex items-center">
            <div className="w-12 shrink-0 flex justify-center absolute left-0 group-hover:opacity-0 transition-opacity duration-200">
              <img src={logoSmall} alt="ASTOR" className="h-10 w-10 object-contain" />
            </div>

            <div className="absolute left-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
              <img src={theme === 'dark' ? logo4 : logo2} alt="ASTOR" className="h-10 w-auto" />
            </div>
          </div>

          {/* NAWIGACJA GŁÓWNA */}
          <nav className="space-y-2">
            <NavLink to="/admin" end className={navItemClass}>
              <div className="w-12 shrink-0 flex justify-center items-center"><ChartNoAxesCombined size={20} /></div>
              <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">Statystyki</span>
            </NavLink>
            
            <NavLink to="/admin/inventory" end className={navItemClass}>
              <div className="w-12 shrink-0 flex justify-center items-center"><Package size={20} /></div>
              <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">Zasoby</span>
            </NavLink>
            
            <NavLink to="/admin/reservations" className={navItemClass}>
              <div className="relative w-12 shrink-0 flex justify-center items-center">
                <Clock size={20} />
                {hasPendingReservations && (
                  <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                  </span>
                )}
              </div>
              <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">Rezerwacje</span>
            </NavLink>

            <NavLink to="/admin/add" className={navItemClass}>
              <div className="w-12 shrink-0 flex justify-center items-center"><PlusCircle size={20} /></div>
              <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">Dodaj zasób</span>
            </NavLink>
          </nav>
        </div>

        {/* DOLNE PRZYCISKI AKCJI */}
        <div className="space-y-2">
          
          {/* DODANO: Przycisk Pomoc */}
          <button 
            onClick={() => setIsHelpOpen(true)} 
            className="flex items-center h-12 w-full rounded-xl transition-all duration-300 text-appMuted hover:text-appPrimary hover:bg-appPrimary/10 font-bold text-sm cursor-pointer overflow-hidden group/help"
          >
            <div className="w-12 shrink-0 flex justify-center items-center"><CircleHelp size={20} /></div>
            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
              Pomoc
            </span>
          </button>

          <button 
            onClick={toggleTheme} 
            className="flex items-center h-12 w-full rounded-xl transition-all duration-300 text-appMuted hover:text-appText hover:bg-appInputBg font-bold text-sm cursor-pointer overflow-hidden group/theme"
          >
            <div className="w-12 shrink-0 flex justify-center items-center">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
              Zmień motyw
            </span>
          </button>

          <button 
            onClick={handleLogout} 
            className="flex items-center h-12 w-full rounded-xl transition-all duration-300 text-appMuted hover:text-red-500 hover:bg-red-500/10 font-bold text-sm cursor-pointer overflow-hidden group/logout"
          >
            <div className="w-12 shrink-0 flex justify-center items-center"><LogOut size={20} /></div>
            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">Wyloguj</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-20 p-8">
        <div className="max-w-[1400px] mx-auto">
          <Outlet context={{ setHasPendingReservations }} />
        </div>
      </main>

      {/* DODANO: Renderowanie modala */}
      <AdminHelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}