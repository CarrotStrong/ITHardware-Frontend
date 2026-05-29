import React, { useState, useEffect } from 'react';
import { X, History, Clock, CheckCircle, XCircle, Package, AlertCircle, Calendar } from 'lucide-react';
import { scrollLock } from '../hooks/scrollLock';
import { authFetch } from '../api';
import FocusTrap from 'focus-trap-react';

export default function MyReservationsModal({ isOpen, onClose }) {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  scrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const fetchMyReservations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await authFetch('/reservations/my');
        if (!res.ok) throw new Error('Nie udało się pobrać rezerwacji');
        
        const data = await res.json();
        setReservations(data);
      } catch (err) {
        console.error('Błąd pobierania rezerwacji:', err);
        setError('Wystąpił problem z wczytaniem Twoich rezerwacji. Spróbuj ponownie później.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyReservations();
  }, [isOpen]);

  if (!isOpen) return null;

  const getStatusConfig = (status) => {
    switch (status) {
      case 'PENDING':
        return { text: 'Oczekuje na akceptację', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', Icon: Clock };
      case 'ACCEPTED':
        return { text: 'Gotowa do odbioru', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', Icon: CheckCircle };
      case 'REJECTED':
        return { text: 'Odrzucona', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', Icon: XCircle };
      case 'EXPIRED':
        return { text: 'Wygasła', color: 'text-appMuted', bg: 'bg-appInputBg', border: 'border-appBorder', Icon: AlertCircle };
      case 'SOLD':
        return { text: 'Odebrana', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', Icon: Package };
      default:
        return { text: status, color: 'text-appMuted', bg: 'bg-appInputBg', border: 'border-appBorder', Icon: History };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('pl-PL', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <FocusTrap focusTrapOptions={{ allowOutsideClick: true }}>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div 
          className="bg-appModalBg rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex justify-between items-center px-6 py-4 border-b border-appBorder bg-appModalBg z-10 shrink-0">
            <div className="flex items-center gap-3 text-appText">
              <History className="text-appPrimary" size={22} />
              <h2 className="text-lg font-bold">Moje rezerwacje</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-appMuted hover:text-appText hover:bg-appInputBg rounded-xl transition-colors cursor-pointer active:scale-95"
            >
              <X size={20} />
            </button>
          </header>

          <div className="overflow-y-auto p-6 flex-1 scroll-smooth bg-appInputBg/30">
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-appMuted">
                <div className="w-8 h-8 border-4 border-appPrimary border-t-transparent rounded-full animate-spin mb-4 shadow-sm"></div>
                <p className="text-xs font-bold tracking-wide uppercase">Pobieranie danych...</p>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-5 rounded-xl text-center flex flex-col items-center gap-2">
                <AlertCircle size={28} />
                <p className="text-xs font-medium">{error}</p>
              </div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-20 text-appMuted flex flex-col items-center">
                <Package size={48} strokeWidth={1} className="opacity-30 mb-4" />
                <p className="text-lg font-bold text-appText mb-1">Pusto tutaj</p>
                <p className="text-xs max-w-xs leading-relaxed">Nie złożyłeś jeszcze żadnej prośby o rezerwację sprzętu z Wystawki.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reservations.map((res) => {
                  const config = getStatusConfig(res.status);
                  const StatusIcon = config.Icon;
                  
                  return (
                    /* Zwarty, jednolity kafelek bez bocznych akcentów */
                    <div 
                      key={res.id} 
                      className="p-4 bg-appCardElevated border border-appBorderStrong rounded-xl shadow-sm transition-all hover:border-appPrimary/40 flex flex-col gap-3 group"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div>
                          <span className="inline-block text-[9px] font-bold text-appMuted uppercase tracking-widest bg-appInputBg px-2 py-0.5 rounded mb-1">
                            {res.type || 'Sprzęt'}
                          </span>
                          <h3 className="text-base font-bold text-appText group-hover:text-appPrimary transition-colors">
                            {res.manufacturer} {res.model}
                          </h3>
                        </div>

                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] uppercase tracking-wider font-bold shrink-0 w-fit ${config.bg} ${config.color} ${config.border}`}>
                          <StatusIcon size={12} strokeWidth={2.5} />
                          {config.text}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 border-t border-appBorder/60 text-xs text-appMuted">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="opacity-70" />
                          <span>Zgłoszono: <strong className="text-appText font-medium">{formatDate(res.created_at)}</strong></span>
                        </div>
                        
                        {res.status === 'ACCEPTED' && res.expires_at && (
                          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
                            <Clock size={12} />
                            <span>Odbiór do: <strong className="font-bold">{formatDate(res.expires_at)}</strong></span>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <footer className="px-6 py-3 border-t border-appBorder bg-appInputBg flex justify-end shrink-0">
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-appPrimary text-white font-bold text-xs rounded-lg hover:bg-appSecondary transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Zamknij
            </button>
          </footer>
        </div>
      </div>
    </FocusTrap>
  );
}