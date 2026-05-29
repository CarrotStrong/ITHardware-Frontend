import { useState, useEffect, useMemo, useContext } from 'react';
import toast from 'react-hot-toast';
import { LayoutGrid, List, Info, ChevronDown, BookMarked, User, Moon, Sun, ArrowUpRight, ShieldUser, Snowflake } from 'lucide-react'
import AsideFilter from '../components/AsideFilter';
import EquipmentCard from '../components/EquipmentCard';
import EquipmentTable from '../components/EquipmentTable';
import ReservationModal from '../components/ReservationModal';
import logo from '../assets/logo.svg';
import logo2 from '../assets/logo2.svg';
import logo4 from '../assets/logo4.svg';
import ContactWidget from '../components/ContactWidget';
import RulesModal from '../components/RulesModal';
import SeasonalEffects from '../components/SeasonalEffects';
import PatchNotesModal from '../components/PatchNotesModal';
import MyReservationsModal from '../components/MyReservationsModal';
import { authFetch } from '../api';
import { Link } from 'react-router-dom';

export default function PublicPage() {

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('appTheme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('appTheme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Animacja
  const [showSplash, setShowSplash] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  //Winter
  const [forceWinter, setForceWinter] = useState(false);

  // Widok
  const [viewType, setViewType] = useState('grid');
  const [items, setItems] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sortOption, setSortOption] = useState('newest');

  // Regulamin
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  //Patch notes
  const [isPatchNotesOpen, setIsPatchNotesOpen] = useState(false);

  //Rezerwacje użytkownika
  const [isMyReservationsOpen, setIsMyReservationsOpen] = useState(false);

  // Informacja o stanie baterii
  const [showInfo, setShowInfo] = useState(() => {
    return localStorage.getItem('batteryInfoDismissed') !== 'true';
  });

  const handleDismiss = () => {
    localStorage.setItem('batteryInfoDismissed', 'true');
    setShowInfo(false);
  };

  useEffect(() => {
    const startExitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 500);

    const removeSplashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 900);

    return () => {
      clearTimeout(startExitTimer);
      clearTimeout(removeSplashTimer);
    };
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/equipment/public');
      
      if (res && res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } else {
        console.error('Błąd serwera przy pobieraniu publicznym');
        setItems([]);
      }
    } catch (err) {
      console.error('Błąd połączenia:', err);
      setItems([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const filteredItems = useMemo(() => {
    let result = [...items];
    
    //Filtrowanie po kategorii
    if (category !== 'all') {
      result = result.filter(item => item.type === category);
    }
    
    //Wyszukiwarka
    if (search) {
      const searchTerms = search.toLowerCase().split(' ').filter(Boolean);
      
      result = result.filter(item => {
        const searchableString = [
          item.manufacturer, item.model, item.notes,
          item.pc_cpu, item.pc_ram, item.pc_disk, item.pc_gpu, item.case_type,
          item.laptop_cpu, item.laptop_ram, item.laptop_disk, item.laptop_gpu,
          item.size, item.resolution, item.aspect_ratio, item.ports_count
        ].filter(Boolean).join(' ').toLowerCase();

        return searchTerms.every(term => searchableString.includes(term));
      });
    }
    
    //Sortowanie
    result.sort((a, b) => {
      if (sortOption === 'price_asc') return Number(a.price) - Number(b.price);
      if (sortOption === 'price_desc') return Number(b.price) - Number(a.price);
      return new Date(b.created_at) - new Date(a.created_at);
    });
    
    return result;
  }, [items, category, search, sortOption]);

  const handleReservationConfirm = async (modalData) => {
    try {
      const res = await authFetch('/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          equipmentId: selectedItem.id,
          location: modalData.location
        })
      });

      if (res.ok) {
        toast.success('Wysłano prośbę o rezerwację!');
        setSelectedItem(null);
        fetchItems();
      } else {
        const err = await res.json();
        toast.error(err.error ? `[${err.code || '!'}] ${err.error}` : 'Błąd rezerwacji');
      }
    } catch (error) {
      console.error('Błąd wywołania API rezerwacji:', error);
      toast.error('Błąd połączenia z serwerem.');
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="bg-appBg text-appText min-h-screen transition-colors duration-300">
      {showSplash && (
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center pb-8 bg-appBg transition-opacity duration-1000 ease-in-out"
        style={{ opacity: isExiting ? 0 : 1 }}
      >
        <div className="relative flex flex-col items-center">
          <img 
            src={theme === 'dark' ? logo4 : logo2} 
            alt="Logo" 
            className="h-16 w-auto transition-transform duration-1000 ease-in pr-14"
          />
          <span className="mt-2 text-appText text-xl">
            IT Hardware
          </span>

          <div className={`mt-10 flex flex-col items-center transition-all duration-500 ${isExiting ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}>
            <div className="w-10 h-10 border-4 border-appBg border-t-appPrimary rounded-full animate-spin"></div>
            <span className="mt-5 text-xs font-semibold text-appMuted uppercase tracking-widest animate-pulse">
              Synchronizacja z Active Directory...
            </span>
          </div>
        </div>
      </div>
    )}
      <div className={`transition-all duration-700 ${isExiting ? 'blur-0' : 'blur-md'}`}>
        <div className="font-sans flex flex-col min-h-screen">
          <header className="relative overflow-hidden sticky top-0 z-30 border-b border-appBorder bg-navPrimary backdrop-blur-md shadow-md">
            <SeasonalEffects forceWinter={forceWinter} />
            <div className="relative z-10 max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
              <div className="flex items-center gap-3 select-none draggable-false">
                <img 
                  src={theme === 'dark' ? logo4 : logo} 
                  alt="ASTOR" 
                  className="h-9 w-auto"
                />
                <h1 className="text-xl font-regular tracking-wide text-white text-shadow-sm hidden sm:block">
                  IT Hardware
                </h1>
              </div> 
              
              <div className="flex items-center gap-4 select-none">
                <Link 
                  to="/admin"
                  className="flex items-center gap-2 mr-2 px-2.5 sm:px-4 h-9.5 text-white bg-black/10 hover:bg-black/20 rounded-xl transition-colors cursor-pointer shadow-inner font-bold text-sm active:scale-95"
                  title="Przejdź do panelu administratora"
                >
                  <ShieldUser size={18} strokeWidth={2.5} />
                  <span className="hidden sm:block tracking-wide">Admin Panel</span>
                </Link>

                <button 
                  onClick={toggleTheme}
                  className="relative w-9.5 h-9.5 text-white bg-black/10 hover:bg-black/20 rounded-xl transition-colors cursor-pointer shadow-inner flex items-center justify-center overflow-hidden"
                  title="Zmień motyw"
                >
                  <div 
                    className={`absolute transition-all duration-500 ease-out ${
                      theme === 'light' 
                        ? 'translate-x-0 opacity-100 rotate-0'
                        : '-translate-x-10 opacity-0 -rotate-45'
                    }`}
                  >
                    <Sun size={18} strokeWidth={2.5} />
                  </div>

                  <div 
                    className={`absolute transition-all duration-500 ease-out ${
                      theme === 'dark' 
                        ? 'translate-x-0 opacity-100 rotate-0'
                        : 'translate-x-10 opacity-0 rotate-45'
                    }`}
                  >
                    <Moon size={18} strokeWidth={2.5} />
                  </div>
                </button>

                <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-black/10 cursor-pointer"
                onClick={() => setIsMyReservationsOpen(true)}
                title="Kliknij, aby zobaczyć swoje rezerwacje"
                >
                  <div className="bg-black/10 text-white p-2.5 rounded-xl shadow-inner">
                    <User size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-white/60 leading-tight mb-0.5">
                      Zalogowano jako
                    </span>
                    <span className="text-[14px] font-bold text-white tracking-wide leading-tight group-hover:text-white transition-colors">
                      Demo Account
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </header>

          <div className="grow max-w-7xl mx-auto w-full px-6 pt-10 pb-6">
            <div className="flex flex-col lg:flex-row gap-8">
              
              <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-4 lg:sticky lg:top-[7.5rem] lg:h-[calc(100vh-9rem)]">
  
                <AsideFilter 
                  search={search}
                  setSearch={setSearch}
                  category={category}
                  setCategory={setCategory}
                  sortOption={sortOption}
                  setSortOption={setSortOption}
                />

                <button
                  onClick={() => setIsRulesOpen(true)}
                  className="w-full rounded-2xl border border-appBorder bg-appCard backdrop-blur-md px-6 py-4 shadow-md transition-all hover:shadow-lg text-appText hover:text-appPrimary flex items-center justify-center group cursor-pointer shrink-0"
                >
                  <div className="relative flex items-center">
                    <BookMarked 
                      size={18} 
                      className="absolute right-full mr-2 text-appMuted group-hover:text-appPrimary transition-colors" 
                    />
                    <span>Regulamin</span>
                  </div>
                </button>

                <div>
                  <label className="w-full rounded-2xl border border-appBorder bg-appCard backdrop-blur-md px-6 py-4 shadow-md transition-all hover:shadow-lg text-appText flex items-center justify-between cursor-pointer shrink-0 group select-none">
                    <div className="relative left-1/2 -translate-x-1/2 pr-[26px] flex items-center gap-2">
                      <Snowflake size={18} className=" text-appMuted group-hover:text-appPrimary transition-colors"/>
                      <span className="text-md group-hover:text-blue-500 transition-colors">Efekt Zimy</span>
                    </div>
                    
                    <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 ${forceWinter ? 'bg-appPrimary' : 'bg-gray-400/40 dark:bg-gray-600'}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300 ${forceWinter ? 'translate-x-4.5' : 'translate-x-1'}`} />
                    </div>
                    
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={forceWinter} 
                      onChange={() => setForceWinter(!forceWinter)} 
                    />
                  </label>
                </div>

                <div className="mt-auto pb-4 shrink-0 flex flex-col items-center gap-1">
                  <button 
                    onClick={() => setIsPatchNotesOpen(true)}
                    className="text-appMuted text-[10px] select-none uppercase tracking-widest flex items-center gap-1 hover:text-appPrimary transition-colors opacity-60 hover:opacity-100 group cursor-pointer"
                  >
                    Patch notes 
                    <ArrowUpRight size={10} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <p className="text-appMuted text-[10px] select-none uppercase tracking-widest opacity-60">
                    © 2026 RESERVER IT Hardware • v1.1
                  </p>
                </div>
                
              </aside>

              <main className="flex-1 pb-4">
                <div className="mb-2 flex items-baseline justify-between pl-2">
                  <h2 className="text-2xl font-bold text-appText tracking-tight flex">
                    Oferta
                    <span className="ml-3 mt-1 text-sm font-medium text-appMuted px-2 py-1 rounded-full">{filteredItems.length}</span>
                  </h2>
                  <div className="flex justify-end items-center mb-4">
                    <div className="flex items-center mr-6">
                      <h3 className="text-appMuted text-sm mr-4">
                        Sortowanie:
                      </h3>
                      <div className="relative">
                        <select 
                          className="w-full pl-4 pr-8 py-2.5 bg-appCard border border-appBorder rounded-xl focus:border-appPrimary focus:ring-2 focus:ring-appPrimary/20 outline-none text-sm cursor-pointer shadow-sm appearance-none text-appText"
                          value={sortOption}
                          onChange={e => setSortOption(e.target.value)}
                        >
                          <option value="newest">Najnowsze</option>
                          <option value="price_asc">Cena: rosnąco</option>
                          <option value="price_desc">Cena: malejąco</option>
                        </select>
                        <ChevronDown 
                          size={16} 
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-appMuted pointer-events-none" 
                        />
                      </div>
                    </div>
                    <p className="text-appMuted text-sm mr-4">Widok:</p>
                    <div className="flex bg-appCard p-1 rounded-xl border border-appBorder backdrop-blur-sm shadow-sm">
                      <button 
                        onClick={() => setViewType('grid')}
                        title="Siatka"
                        className={`p-2 rounded-lg transition-all cursor-pointer ${
                          viewType === 'grid' 
                            ? 'bg-appPrimary text-white shadow-md' 
                            : 'text-appMuted hover:text-appPrimary'
                        }`}
                      >
                        <LayoutGrid size={18} />
                      </button>
                      <button 
                        onClick={() => setViewType('table')}
                        title="Lista"
                        className={`p-2 rounded-lg transition-all cursor-pointer ${
                          viewType === 'table' 
                            ? 'bg-appPrimary text-white shadow-md' 
                            : 'text-appMuted hover:text-appPrimary'
                        }`}
                      >
                        <List size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {showInfo && (
                  <div className="relative flex flex-col md:flex-row items-center gap-5 p-6 pt-7 border border-x-0 border-b-0 border-appInfoBorder bg-[image:var(--theme-info-gradient)] rounded-2xl mb-10 shadow-md backdrop-blur-sm transform-gpu will-change-transform">
                    
                    <div className="p-3 bg-appInfoIconBg text-appInfoIconText rounded-xl shrink-0 shadow-inner">
                      <Info size={22} strokeWidth={2} />
                    </div>

                    <div className="flex-1 text-sm leading-relaxed text-appText pr-2">
                      <p className="font-bold text-xs uppercase tracking-widest text-appInfoText mb-1.5 cursor-default">
                        Ważna informacja o bateriach
                      </p>
                      <p className="cursor-default">
                        Laptopy pochodzą z użytku wewnętrznego, gdzie były stale podłączone do zasilania. 
                        W związku z tym <span className="font-semibold px-1 rounded bg-appInfoHighlight">baterie mogą być w pełni zużyte</span>. Dla stabilnej pracy zalecamy korzystanie z zasilacza.
                      </p>
                    </div>
                    
                    <button 
                      onClick={handleDismiss}
                      className="md:self-center whitespace-nowrap px-5 py-2.5 ml-auto md:ml-0 text-xs font-bold text-appText bg-appInfoHighlight border border-appBorder hover:bg-appInfoHighlight/80 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      Rozumiem, zamknij
                    </button>
                  </div>
                )}

                {loading ? (
                  <div className="text-appMuted text-center py-20 animate-pulse">Ładowanie oferty...</div>
                ) : filteredItems.length > 0 ? (
                  viewType === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredItems.map((item) => (
                        <EquipmentCard 
                          key={item.id} 
                          item={item} 
                          onReserve={setSelectedItem} 
                        />
                      ))}
                    </div>
                  ) : (
                    <EquipmentTable 
                      items={filteredItems} 
                      onReserve={setSelectedItem} 
                    />
                  )
                ) : (
                  <div className="py-16 rounded-3xl border border-appBorder bg-appCard text-center text-appMuted backdrop-blur-sm">
                    Brak wyników.
                  </div>
                )}
              </main>
            </div>
          </div>
          
          <ReservationModal 
            isOpen={!!selectedItem} 
            itemName={selectedItem ? `${selectedItem.manufacturer} ${selectedItem.model}` : ''}
            onClose={() => setSelectedItem(null)} 
            onConfirm={handleReservationConfirm}
          />
        </div>
      </div>
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      <PatchNotesModal isOpen={isPatchNotesOpen} onClose={() => setIsPatchNotesOpen(false)} />
      <MyReservationsModal 
        isOpen={isMyReservationsOpen} 
        onClose={() => setIsMyReservationsOpen(false)} 
      />
      <ContactWidget />
    </div>
  );
}