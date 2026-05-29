import { useState, useEffect, Fragment } from 'react';
import { CheckCircle, AlertCircle, History, Check, X, DollarSign, Ban, Copy, PackageOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { authFetch } from '../../api';
import toast from 'react-hot-toast';
import { useOutletContext } from 'react-router-dom';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setHasPendingReservations } = useOutletContext() || {};
  const [expandedLogs, setExpandedLogs] = useState([]);

  const toggleExpandLog = (eqId) => {
    setExpandedLogs(prev => 
      prev.includes(eqId) ? prev.filter(id => id !== eqId) : [...prev, eqId]
    );
  };

  //Grupowanie historii
  const groupedAuditLogs = auditLog.reduce((acc, current) => {
    const group = acc.find(g => g.equipment_id === current.equipment_id);
    if (group) {
      group.history.push(current);
    } else {
      acc.push({ equipment_id: current.equipment_id, latest: current, history: [] });
    }
    return acc;
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await authFetch('/reservations/admin-list');
      if (res && res.ok) setReservations(await res.json());

      const logRes = await authFetch('/reservations/audit-log');
      if (logRes && logRes.ok) setAuditLog(await logRes.json());

    } catch (err) {
      toast.error('Nie udało się pobrać rezerwacji');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); }, []);

  useEffect(() => {
    if (setHasPendingReservations) {
      const hasPending = reservations.some(r => r.status === 'pending');
      setHasPendingReservations(hasPending);
    }
  }, [reservations, setHasPendingReservations]);

  const handleAction = async (id, action) => {
    try {
      const res = await authFetch(`/reservations/${id}/${action}`, { method: 'PATCH' });
      
      if (res.ok) {
        toast.success('Zaktualizowano status');
        setReservations(prevReservations => 
          prevReservations.map(req => {
            if (req.id === id) {
              const statusMap = {
                'approve': 'approved',
                'reject': 'rejected',
                'issue': 'issued',
                'cancel': 'cancelled',
                'sell': 'sold'
              };
              return { ...req, status: statusMap[action] || req.status };
            }
            return req;
          })
        );

        fetchReservations();
        
      } else {
        const errData = await res.json();
        toast.error(errData.error ? `[${errData.code || '!'}] ${errData.error}` : 'Błąd aktualizacji');
      }
    } catch (err) {
      toast.error('Błąd połączenia z serwerem');
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('pl-PL', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  // obliczanie czasu do wygaśnięcia
  const getTimeLeft = (expiresAt) => {
    if (!expiresAt) return { days: 0, hours: 0, isExpired: true };
    const expires = new Date(expiresAt.replace(' ', 'T'));
    
    if (isNaN(expires.getTime())) {
      return { days: 0, hours: 0, isExpired: true };
    }

    const now = new Date();
    const diffMs = expires - now;

    if (diffMs <= 0) return { days: 0, hours: 0, isExpired: true };

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    
    return { days, hours, isExpired: false };
  };

  const getFullName = (item) => {
    const first = item.buyer_first_name || '';
    const last = item.buyer_last_name || '';
    const full = `${first} ${last}`.trim();
    return full ? `${full} (${item.reserved_by})` : item.reserved_by;
  };

  const pending = reservations.filter(r => r.status === 'pending');
  const active = reservations.filter(r => ['approved', 'issued'].includes(r.status));

  // tłumaczenia statusów dla historii
  const translateEquipmentStatus = (status) => {
    switch (status) {
      case 'available': 
        return { label: 'Dostępny', color: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' };
      case 'reserved': 
        return { label: 'Zarezerwowany', color: 'bg-blue-500/10 text-blue-500 border border-blue-500/20' };
      case 'issued_tested': 
        return { label: 'Wydany do testów', color: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' };
      case 'sold': 
        return { label: 'Sprzedany', color: 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20' };
      case 'private': 
        return { label: 'Prywatny', color: 'bg-stone-500/10 text-stone-500 border border-stone-500/20' };
      
      case 'Zarezerwowane (oczekuje na akceptację)':
        return { label: 'Rezerwacja (Prośba)', color: 'bg-amber-500/10 text-amber-500 border border-amber-500/20' };
      case 'rejected': 
        return { label: 'Odrzucona (Prośba)', color: 'bg-red-500/10 text-red-500 border border-red-500/20' };
      case 'cancelled': 
        return { label: 'Anulowana (Rezerwacja)', color: 'bg-orange-500/10 text-orange-500 border border-orange-500/20' };
      case 'expired': 
        return { label: 'Wygasła automatycznie', color: 'bg-purple-500/10 text-purple-500 border border-purple-500/20' };
      
      default: 
        return { label: status || 'Nieznany', color: 'bg-slate-500/10 text-slate-500 border border-slate-500/20' };
    }
  };

  const handleCopyAST = (astNumber) => {
    if (!astNumber) return;
    
    navigator.clipboard.writeText(astNumber)
      .then(() => {
        toast.success(`Skopiowano: ${astNumber}`, {
          style: {
            borderRadius: '10px',
            background: 'var(--theme-card)',
            color: 'var(--theme-text)',
            border: '1px solid var(--theme-border)',
          },
        });
      })
      .catch(err => {
        console.error('Błąd kopiowania:', err);
        toast.error('Nie udało się skopiować');
      });
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-appMuted font-medium">Ładowanie widoku rezerwacji...</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-appText flex items-center gap-2">
          <History className="text-appPrimary" size={24} /> Zarządzanie rezerwacjami
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* OCZEKUJĄCE PROŚBY */}
        <section className="bg-appCard p-6 rounded-2xl border border-appBorder shadow-sm flex flex-col h-full max-h-125 transition-colors duration-300">
          <h2 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-appBorder pb-2 shrink-0">
            <AlertCircle size={16} /> Oczekujące prośby ({pending.length})
          </h2>
          
          <div className="space-y-3 flex-1 overflow-y-auto pr-2">
            {pending.length === 0 && (
              <div className="h-full min-h-37.5 flex flex-col items-center justify-center text-appMuted">
                <AlertCircle size={32} className="opacity-20 mb-2" />
                <p className="text-sm italic">Brak nowych próśb.</p>
              </div>
            )}
            {pending.map(req => (
              <div key={req.id} className="p-4 bg-appCardElevated border border-appBorderStrong rounded-xl shadow-sm flex flex-col sm:flex-row gap-4 justify-between sm:items-center transition-all hover:border-amber-500/50">
                <div>
                  <p className="font-bold text-appText">{getFullName(req)}</p>
                  <div className="text-xs text-appMuted mt-0.5 flex flex-wrap items-center gap-1.5">
                    Sprzęt: <span className="font-bold text-appText">{req.manufacturer} {req.model}</span>
                    {req.ast_number && (
                      <span 
                        onClick={() => handleCopyAST(req.ast_number)}
                        className="group flex items-center gap-1.5 text-[10px] bg-appPrimary hover:bg-appSecondary text-white px-2 py-1 rounded border border-appPrimary/50 font-bold cursor-pointer transition-all active:scale-95"
                        title="Kliknij, aby skopiować"
                      >
                        {req.ast_number}
                        <Copy size={12} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-appMuted mt-1 font-mono">{formatDateTime(req.created_at)}</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto shrink-0">
                  <button onClick={() => handleAction(req.id, 'approve')} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 text-white border border-transparent text-xs font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-sm cursor-pointer active:scale-95">
                    <Check size={14}/> Akceptuj
                  </button>
                  <button onClick={() => handleAction(req.id, 'reject')} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-appInputBg text-appMuted border border-appBorder text-xs font-bold rounded-lg hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/50 transition-all cursor-pointer active:scale-95">
                    <X size={14}/> Odrzuć
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AKTYWNE REZERWACJE */}
        <section className="bg-appCard p-6 rounded-2xl border border-appBorder shadow-sm flex flex-col h-full max-h-125 transition-colors duration-300">
          <h2 className="text-xs font-bold text-appPrimary uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-appBorder pb-2 shrink-0">
            <CheckCircle size={16} /> Zatwierdzone ({active.length})
          </h2>
          
          <div className="space-y-3 flex-1 overflow-y-auto pr-2">
            {active.length === 0 && (
              <div className="h-full min-h-37.5 flex flex-col items-center justify-center text-appMuted">
                <CheckCircle size={32} className="opacity-20 mb-2" />
                <p className="text-sm italic">Brak aktywnych rezerwacji.</p>
              </div>
            )}
            {active.map(res => {
              const { days, hours, isExpired } = getTimeLeft(res.expires_at);
              const isIssued = res.status === 'issued';

              return (
                <div key={res.id} className="p-4 bg-appCardElevated border border-appBorderStrong rounded-xl shadow-sm transition-all hover:border-appPrimary/50">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-appText">{getFullName(res)}</p>
                        
                        {isIssued ? (
                          <span className="text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                            Wydany/testowany
                          </span>
                        ) : (
                          <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider border ${
                            isExpired ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                            days < 1 ? 'bg-orange-500/10 text-orange-500 border-orange-500/20 animate-pulse' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          }`}>
                            {isExpired ? 'Wygasa/Wygasła' : `Zostało: ${days}d ${hours}h`}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-xs text-appMuted flex flex-wrap items-center gap-1.5 mt-1">
                        {res.manufacturer} {res.model}
                        {res.ast_number && (
                          <span 
                            onClick={() => handleCopyAST(res.ast_number)}
                            className="group flex items-center gap-1.5 text-[10px] bg-appPrimary hover:bg-appSecondary text-white px-2 py-1 rounded border border-appPrimary/50 font-bold cursor-pointer transition-all active:scale-95"
                            title="Kliknij, aby skopiować"
                          >
                            {res.ast_number}
                            <Copy size={12} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                          </span>
                        )}
                      </div>
                      
                      {!isIssued && (
                        <p className="text-[10px] text-appMuted font-mono">Do: {formatDateTime(res.expires_at)}</p>
                      )}
                      
                      <p className="text-[10px] text-appMuted font-mono mt-0.5">
                        Ostatnia zmiana: <span className="font-bold text-appText">{res.updated_by || 'System'}</span>
                      </p>
                    </div>

                    {/* DYNAMICZNE BUTTONY */}
                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto justify-end shrink-0">
                      
                      {!isIssued && (
                        <button 
                          onClick={() => { if(confirm('Czy na pewno chcesz wydać sprzęt? Zatrzyma to licznik czasu.')) handleAction(res.id, 'issue'); }}
                          className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-xs font-bold rounded-lg hover:bg-indigo-500 hover:text-white transition-all cursor-pointer active:scale-95"
                        >
                          <PackageOpen size={14} /> Wydaj sprzęt
                        </button>
                      )}

                      {isIssued && (
                        <button 
                          onClick={() => { if(confirm('Sfinalizować i oznaczyć sprzęt jako SPRZEDANY?')) handleAction(res.id, 'sell'); }}
                          className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 px-3 py-1.5 bg-appPrimary/10 text-appPrimary border border-appPrimary/20 text-xs font-bold rounded-lg hover:bg-appPrimary hover:text-white transition-all cursor-pointer active:scale-95"
                        >
                          <DollarSign size={14} /> Sprzedaj
                        </button>
                      )}
                      
                      <button 
                        onClick={() => { if(confirm(isIssued ? 'Pracownik zrezygnował? Sprzęt wróci na wystawkę.' : 'Czy na pewno chcesz anulować rezerwację? Sprzęt wróci na wystawkę.')) handleAction(res.id, 'cancel'); }}
                        className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 px-3 py-1.5 bg-appInputBg text-appMuted border border-appBorder text-xs font-bold rounded-lg hover:text-orange-500 hover:bg-orange-500/10 hover:border-orange-500/50 transition-all cursor-pointer active:scale-95"
                        title="Anuluj i przywróć do oferty"
                      >
                        <Ban size={14} /> {isIssued ? 'Rezygnacja' : 'Anuluj'}
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* HISTORIA */}
      <section className="bg-appCard p-6 rounded-2xl border border-appBorder shadow-sm flex flex-col transition-colors duration-300">
        <h2 className="text-xs font-bold text-appMuted uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-appBorder pb-2">
          <History size={16} /> Dziennik Zdarzeń (Audit Log)
        </h2>
        
        {auditLog.length === 0 ? (
          <p className="text-sm text-appMuted italic text-center py-6">Historia jest pusta.</p>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-92 border border-appBorder rounded-lg">
            <table className="w-full text-left text-sm whitespace-nowrap relative">
              <thead className="text-[10px] text-appMuted uppercase font-bold bg-appInputBg sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="py-3 px-4">Data zdarzenia</th>
                  <th className="py-3 px-4">Sprzęt</th>
                  <th className="py-3 px-4">Aktualny status</th>
                  <th className="py-3 px-4">Szczegóły</th>
                  <th className="py-3 px-4">Kto wykonał zmianę</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-appBorder">
                {groupedAuditLogs.map(group => {
                  const h = group.latest;
                  const hStatus = translateEquipmentStatus(h.new_status);
                  const hasHistory = group.history.length > 0;
                  const isExpanded = expandedLogs.includes(group.equipment_id);

                  return (
                    <Fragment key={group.equipment_id}>
                      <tr 
                        onClick={() => hasHistory && toggleExpandLog(group.equipment_id)}
                        className={`transition-colors ${hasHistory ? 'cursor-pointer hover:bg-appInputBg/80' : 'hover:bg-appInputBg/50'}`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-appMuted font-mono text-xs">
                            {hasHistory ? (
                              <button className="shrink-0 text-appMuted hover:text-appPrimary transition-colors focus:outline-none cursor-pointer">
                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              </button>
                            ) : (
                              <span className="w-4 shrink-0 inline-block"></span>
                            )}
                            <span className="whitespace-nowrap">{formatDateTime(h.created_at)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-appText font-bold">
                          <div className="flex items-center gap-2">
                            <span className="whitespace-nowrap">{h.manufacturer} {h.model}</span>
                            {h.ast_number && (
                              <span 
                                onClick={(e) => {
                                  e.stopPropagation(); 
                                  handleCopyAST(h.ast_number);
                                }}
                                className="group flex items-center gap-1.5 text-[10px] bg-appPrimary hover:bg-appSecondary text-white px-2 py-1 rounded border border-appPrimary/50 cursor-pointer transition-all active:scale-95"
                                title="Kliknij, aby skopiować"
                              >
                                {h.ast_number}
                                <Copy size={12} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wider whitespace-nowrap border ${hStatus.color}`}>
                            {hStatus.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-appText/80 text-xs font-medium max-w-xs truncate" title={h.comment}>
                          {h.comment}
                        </td>
                        <td className="py-3 px-4 text-appMuted text-xs font-semibold whitespace-nowrap">
                          {h.changed_by || 'System'}
                        </td>
                      </tr>

                      {isExpanded && group.history.map((oldLog) => {
                        const oldStatus = translateEquipmentStatus(oldLog.new_status);
                        return (
                          <tr key={oldLog.id} className="bg-appInputBg/40">
                            <td className="py-2.5 px-4">
                              <div className="pl-6 flex items-center text-appMuted font-mono text-[11px]">
                                <span className="text-appPrimary/40 mr-1.5">└</span>
                                <span className="whitespace-nowrap">{formatDateTime(oldLog.created_at)}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-4 text-appMuted font-medium text-[11px] whitespace-nowrap">
                              {oldLog.manufacturer} {oldLog.model}
                            </td>
                            <td className="py-2.5 px-4">
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider whitespace-nowrap border ${oldStatus.color}`}>
                                {oldStatus.label}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-appMuted text-[11px] max-w-xs truncate" title={oldLog.comment}>
                              {oldLog.comment}
                            </td>
                            <td className="py-2.5 px-4 text-appMuted/70 text-[11px] whitespace-nowrap">
                              {oldLog.changed_by || 'System'}
                            </td>
                          </tr>
                        );
                      })}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}