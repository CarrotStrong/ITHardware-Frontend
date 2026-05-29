import { useState, useEffect } from 'react';
import { X, Clock, MessageSquare, Save, Settings2, CircleAlert, Info } from 'lucide-react';
import { authFetch } from '../api';
import toast from 'react-hot-toast';

const getDotColor = (status) => {
  switch (status) {
    case 'available': return 'bg-emerald-500';
    case 'reserved': return 'bg-amber-500';
    case 'issued_tested': return 'bg-blue-600';
    case 'sold': return 'bg-red-600';
    case 'cancelled': return 'bg-rose-400';
    case 'private': return 'bg-purple-800';
    case 'Zezłomowany': return 'bg-slate-800';
    case 'Do zezłomowania (odzłomowany)': return 'bg-teal-700';
    default: return 'bg-slate-300';
  }
};

// Tłumaczenia labelek
const statusTranslations = {
  available: 'Dostępny', reserved: 'Zarezerwowany', issued_tested: 'Wydany / Testowany', sold: 'Sprzedany / Rozliczony', private: 'Prywatny', cancelled: 'Rezerwacja anulowana'
};

const SPECS_CONFIG = {
  laptop: { cpu: 'Procesor', ram: 'Pamięć RAM', disk: 'Dysk', gpu: 'Karta graficzna' },
  computer: { cpu: 'Procesor', ram: 'Pamięć RAM', disk: 'Dysk', gpu: 'Karta graficzna', case_type: 'Obudowa' },
  monitor: { size: 'Przekątna', resolution: 'Rozdzielczość', aspect_ratio: 'Proporcje' },
  switch: { ports_count: 'Ilość portów' }
};

const FormInput = ({ label, name, value, onChange, placeholder, type = "text", required }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-bold text-appMuted uppercase tracking-wider pl-1">
      {label} {required && <span className="text-red-500 text-xs">*</span>}
    </label>
    <input 
      type={type} name={name} value={value || ''} onChange={onChange} placeholder={placeholder} required={required} 
      className="w-full px-3 py-2 text-sm bg-appInputBg text-appText border border-appBorder rounded-lg focus:border-appPrimary focus:bg-appCard outline-none transition-colors shadow-sm" 
    />
  </div>
);

export default function EquipmentStatusModal({ isOpen, onClose, item, onSaved }) {
  const [activeTab, setActiveTab] = useState('status');

  // Status i historia
  const [editStatus, setEditStatus] = useState('');
  const [editComment, setEditComment] = useState('');
  const [isScrapped, setIsScrapped] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Szczegóły sprzętu
  const [formData, setFormData] = useState({ manufacturer: '', model: '', ast_number: '', price: '', notes: '', specs: {} });
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      setActiveTab('status');
      // Reset zakładki statusu
      setEditStatus(item.status);
      setEditComment('');
      setIsScrapped(item.is_scrapped || false);
      fetchHistory(item.id);

      // Mapowanie danych do zakładki edycji
      let mappedSpecs = {};
      if (item.type === 'laptop') mappedSpecs = { cpu: item.laptop_cpu, ram: item.laptop_ram, disk: item.laptop_disk, gpu: item.laptop_gpu };
      if (item.type === 'computer') mappedSpecs = { cpu: item.pc_cpu, ram: item.pc_ram, disk: item.pc_disk, gpu: item.pc_gpu, case_type: item.case_type };
      if (item.type === 'monitor') mappedSpecs = { size: item.size, resolution: item.resolution, aspect_ratio: item.aspect_ratio };
      if (item.type === 'switch') mappedSpecs = { ports_count: item.ports_count };

      setFormData({
        manufacturer: item.manufacturer || '',
        model: item.model || '',
        ast_number: item.ast_number || '',
        price: item.price || '',
        notes: item.notes || '',
        specs: mappedSpecs
      });
    }
  }, [isOpen, item]);

  const fetchHistory = async (id) => {
    setLoadingHistory(true);
    try {
      const res = await authFetch(`/equipment/${id}/history`);
      if (res.ok) setHistory(await res.json());
    } catch (e) {
      toast.error('Nie udało się pobrać historii');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleStatusSave = async () => {
    if (!editComment.trim()) return toast.error('Musisz dodać komentarz do zmiany!');
    try {
      let statusChanged = false;
      let scrapChanged = false;

      if (editStatus !== item.status) {
        const resStatus = await authFetch(`/equipment/${item.id}/status`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: editStatus, comment: editComment })
        });
        if (!resStatus.ok) throw new Error('Błąd zmiany statusu');
        statusChanged = true;
      }

      if (!!item.ast_number && isScrapped !== (item.is_scrapped || false)) {
        const resScrap = await authFetch(`/equipment/${item.id}/scrapped`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isScrapped: isScrapped, comment: editComment }) 
        });
        if (!resScrap.ok) throw new Error('Błąd zmiany flagi złomowania');
        scrapChanged = true;
      }

      if (!statusChanged && !scrapChanged) return toast.error('Nie wprowadzono żadnych zmian do zapisania.');
      
      toast.success('Status został zaktualizowany!');
      onSaved();
    } catch (e) {
      toast.error(e.message || 'Wystąpił błąd podczas zapisu statusu');
    }
  };

  const handleDetailsSave = async () => {
    // Walidacja głównych pól
    if (!formData.manufacturer || !formData.model || !formData.price) {
      return toast.error('Producent, Model oraz Wycena są wymagane!');
    }

    // Walidacja AST
    const isAstRequired = ['laptop', 'computer'].includes(item.type);
    if (isAstRequired && !formData.ast_number) {
      return toast.error('Numer NRI jest wymagany dla tego typu sprzętu!');
    }

    // Walidacja specyfikacji technicznej
    if (SPECS_CONFIG[item.type]) {
      for (const key of Object.keys(SPECS_CONFIG[item.type])) {
        if (!formData.specs[key]) {
          return toast.error(`Wypełnij wszystkie pola specyfikacji technicznej!`);
        }
      }
    }
    
    setIsSavingDetails(true);
    try {
      const res = await authFetch(`/equipment/${item.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Błąd aktualizacji danych');
      
      toast.success('Dane sprzętu zostały zaktualizowane!');
      onSaved(); 
    } catch (e) {
      toast.error(e.message || 'Błąd zapisu danych');
    } finally {
      setIsSavingDetails(false);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-appCard rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-appBorder flex justify-between items-center bg-appInputBg/50 shrink-0">
          <h2 className="text-lg font-bold text-appText flex items-center gap-2">
            <Settings2 size={20} className="text-appPrimary"/> 
            Zarządzaj: {item.manufacturer} {item.model}
          </h2>
          <button onClick={onClose} className="text-appMuted hover:text-appText transition-colors"><X size={20} /></button>
        </div>

        {/* ZAKŁADKI */}
        <div className="flex border-b border-appBorder px-6 shrink-0 bg-appCard">
          <button 
            onClick={() => setActiveTab('status')}
            className={`py-3 px-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'status' ? 'border-appPrimary text-appPrimary' : 'border-transparent text-appMuted hover:text-appText hover:border-appBorder'}`}
          >
            Status i historia
          </button>
          <button 
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'details' ? 'border-appPrimary text-appPrimary' : 'border-transparent text-appMuted hover:text-appText hover:border-appBorder'}`}
          >
            Szczegóły sprzętu
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-appCard flex-1">
          
          {/* STATUS I HISTORIA */}
          {activeTab === 'status' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="bg-appInputBg/30 border border-appBorder rounded-2xl p-5 md:p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  <div className="space-y-5 flex flex-col justify-between">
                    <div>
                      <label className="block text-xs font-semibold text-appMuted mb-2 uppercase tracking-wider">Status sprzętu</label>
                      <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full px-4 py-3 bg-appInputBg text-appText border border-appBorder rounded-xl text-sm focus:ring-2 focus:ring-appPrimary/20 outline-none shadow-sm cursor-pointer transition-all">
                        <option value="available">Dostępny</option>
                        <option value="reserved">Zarezerwowany</option>
                        <option value="issued_tested">Wydany / Testowany</option>
                        <option value="sold">Sprzedany / Rozliczony</option>
                        <option value="private">Prywatny</option>
                      </select>
                    </div>
                    <div>
                      <label className={`flex items-start gap-3 p-3.5 border rounded-xl transition-colors h-full bg-appInputBg shadow-sm ${!!item.ast_number ? 'cursor-pointer group border-appBorder hover:border-red-500/50 hover:bg-red-500/10' : 'cursor-not-allowed border-appBorder bg-appInputBg/50 opacity-60'}`}>
                        <input type="checkbox" checked={isScrapped} onChange={(e) => setIsScrapped(e.target.checked)} disabled={!item.ast_number} className="mt-0.5 w-4 h-4 border-2 border-appBorder rounded text-red-500 focus:ring-red-500 cursor-pointer disabled:cursor-not-allowed" />
                        <div className="flex flex-col">
                          <span className={`text-sm font-semibold transition-colors ${!!item.ast_number ? 'text-appText group-hover:text-red-500' : 'text-appMuted'}`}>Zezłomowany w CMMS?</span>
                          <span className="text-[10px] text-appMuted mt-1 leading-relaxed">Zaznacz, jeżeli sprzęt jest już zezłomowany (wyłączony z obiegu).</span>
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col h-full">
                    <label className="block text-xs font-semibold text-appMuted mb-2 uppercase tracking-wider">Powód zmiany (Wymagany)</label>
                    <div className="relative flex-1 flex flex-col h-full">
                      <MessageSquare size={16} className="absolute left-4 top-3.5 text-appMuted" />
                      <textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} placeholder="Dlaczego zmieniasz status? Napisz krótki komentarz..." className="w-full pl-11 pr-4 py-3 bg-appInputBg text-appText border border-appBorder rounded-xl text-sm focus:ring-2 focus:ring-appPrimary/20 outline-none resize-none flex-1 shadow-sm min-h-30 transition-all" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-appBorder mt-2">
                  <div className="flex items-start gap-2 max-w-sm">
                    <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-appMuted leading-relaxed">
                      Tu zmieniasz status z <strong className="text-appText">Prywatny</strong> na <strong className="text-appText">Dostępny</strong>. 
                      Pozostałe statusy służą wyłącznie do ręcznych korekt w skrajnych sytuacjach.
                    </p>
                  </div>
                  <button onClick={handleStatusSave} className="shrink-0 px-5 py-2.5 flex items-center gap-2.5 bg-appPrimary text-white font-bold text-sm rounded-xl hover:bg-appSecondary shadow-sm transition-all cursor-pointer">
                    <Save size={16} /> Zapisz status
                  </button>
                </div>
              </div>

              {/* Historia Zmian Statusu */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-appMuted mb-4 flex items-center gap-2"><Clock size={16} /> Historia Zmian</h3>
                {loadingHistory ? (
                  <p className="text-sm text-appMuted animate-pulse">Pobieranie historii...</p>
                ) : history.length === 0 ? (
                  <p className="text-sm text-appMuted italic">Brak zapisanej historii dla tego sprzętu.</p>
                ) : (
                  <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-appBorder before:to-transparent">
                    {history.map((record, idx) => (
                      <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        <div className={`flex items-center justify-center w-5 h-5 rounded-full border border-appCard shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow ${getDotColor(record.new_status)}`}></div>
                        <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-appBorder bg-appInputBg shadow-sm transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-appText text-xs">{statusTranslations[record.new_status] || record.new_status}</span>
                            <span className="font-mono text-[10px] text-appMuted">{new Date(record.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-appMuted mb-2 whitespace-pre-wrap leading-relaxed">
                            {record.comment}
                          </p>
                          {record.changed_by && <p className="text-[10px] font-bold text-appMuted/70 uppercase tracking-wider text-right">Zmienił: {record.changed_by}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SZCZEGÓŁY SPRZĘTU */}
          {activeTab === 'details' && (
            <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-300">
              
              <div className="px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3 shadow-sm">
                <CircleAlert className="text-amber-500 shrink-0 mt-0.5" size={16} />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-appMuted uppercase tracking-wider mb-0.5">
                    Ważna informacja
                  </span>
                  <p className="text-[11px] text-appText/80 font-medium leading-relaxed">
                    Zmieniasz fizyczne parametry zasobu. Edytuj te pola tylko w przypadku poprawy pomyłki lub faktycznej zmiany specyfikacji sprzętu (np. dołożenie RAMu).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormInput label="Producent" name="manufacturer" value={formData.manufacturer} onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))} required />
                <FormInput label="Model" name="model" value={formData.model} onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))} required />
                
                <FormInput 
                  label="NRI (Numer inwentarzowy)" name="ast_number" value={formData.ast_number} 
                  onChange={(e) => setFormData(prev => ({ ...prev, ast_number: e.target.value }))} 
                  required={['laptop', 'computer'].includes(item.type)} 
                />
                
                <FormInput label="Wycena (PLN)" name="price" type="number" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} required />

                {/* LOKALIZACJA */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-appMuted uppercase tracking-wider pl-1">
                    Lokalizacja <span className="text-red-500 text-xs">*</span>
                  </label>
                  <select
                    value={formData.location || '1'}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-appInputBg text-appText border border-appBorder rounded-lg focus:border-appPrimary focus:bg-appCard outline-none transition-colors shadow-sm cursor-pointer"
                    required
                  >
                    <option value="1">Kraków</option>
                    <option value="2">Warszawa</option>
                  </select>
                </div>
              </div>

              {SPECS_CONFIG[item.type] && (
                <div className="space-y-2 pt-2 border-t border-appBorder mt-4">
                  <h3 className="text-sm font-bold text-appText mt-2">Specyfikacja techniczna</h3>
                  <div className="bg-appInputBg/50 border border-appBorder rounded-xl p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(SPECS_CONFIG[item.type]).map(([key, label]) => (
                      <FormInput 
                        key={key} label={label} name={key} 
                        value={formData.specs[key]} 
                        onChange={(e) => setFormData(prev => ({ ...prev, specs: { ...prev.specs, [key]: e.target.value } }))} 
                        required
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-3">
                <button 
                  onClick={handleDetailsSave} disabled={isSavingDetails}
                  className="px-5 py-2.5 flex items-center gap-2.5 bg-appPrimary text-white font-bold text-sm rounded-xl hover:bg-appSecondary shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Save size={16} /> {isSavingDetails ? 'Zapisywanie...' : 'Zapisz dane sprzętu'}
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}