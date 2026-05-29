import { useState, useEffect } from 'react';
import { Save, PlusCircle, LayoutGrid, Settings2, Eye, AlertCircle, Lightbulb, Tag } from 'lucide-react';
import EquipmentCard from '../../components/EquipmentCard'; 
import toast from 'react-hot-toast';
import { authFetch } from '../../api';

//Funkcja zapobiegająca zróżnicowaniu wpisywanych danych
const formatHardwareSpec = (text, fieldName = '') => {
  if (!text) return text;
  
  let formatted = text.trim();

  formatted = formatted.replace(/\b(i[3579])[\s-]+(\d+[a-zA-Z]*)\b/gi, (match, ix, model) => {
    return `${ix.toLowerCase()}-${model.toUpperCase()}`;
  });
  formatted = formatted.replace(/\bryzen\b/gi, 'Ryzen');
  formatted = formatted.replace(/\bzintegrowana\b/gi, 'Zintegrowana');
  formatted = formatted.replace(/(\d+)\s*(gb|tb|mb)\b/gi, (match, num, unit) => num + unit.toUpperCase());
  formatted = formatted.replace(/\bssd\b/gi, 'SSD');
  formatted = formatted.replace(/\bhdd\b/gi, 'HDD');
  formatted = formatted.replace(/\bnvme\b/gi, 'NVMe'); 
  formatted = formatted.replace(/\bm\.?2\b/gi, 'M.2');
  formatted = formatted.replace(/\b(SSD|HDD|NVMe|M\.2)\s+(\d+(?:GB|TB))\b/gi, '$2 $1');

  if (fieldName === 'ram') {
    if (/^\d+$/.test(formatted)) {
      formatted += 'GB';
    }
  }

  if (fieldName === 'size') {
    if (/^\d+([.,]\d+)?$/.test(formatted)) {
      formatted += '"';
    }
  }

  if (fieldName === 'resolution') {
    formatted = formatted.replace(/(\d+)\s*[xX/]\s*(\d+)/g, '$1x$2');
  }

  if (fieldName === 'aspect_ratio') {
    formatted = formatted.replace(/(\d+)\s*[/xX]\s*(\d+)/g, '$1:$2');
  }

  formatted = formatted.replace(/\s*\+\s*/g, ' + ');
  formatted = formatted.replace(/\s{2,}/g, ' ');

  return formatted.trim();
};

const SPECS_CONFIG = {
  laptop: { cpu: ['Procesor', 'np. i5-8350U'], ram: ['Pamięć RAM', 'np. 16GB'], disk: ['Dysk', 'np. 256GB SSD'], gpu: ['Karta graficzna', 'np. Zintegrowana'] },
  computer: { cpu: ['Procesor', 'np. i7-10700'], ram: ['Pamięć RAM', 'np. 32GB'], disk: ['Dysk', 'np. 1TB SSD'], gpu: ['Karta graficzna', 'np. GTX 1060 6GB'], case_type: ['Obudowa', 'np. Tower'] },
  monitor: { size: ['Przekątna', 'np. 24"'], resolution: ['Rozdzielczość', 'np. 1920x1080'], aspect_ratio: ['Proporcje', 'np. 16:9'] },
  switch: { ports_count: ['Ilość portów', 'np. 24'] }
};

const getEmptySpecs = (type) => Object.keys(SPECS_CONFIG[type]).reduce((acc, key) => ({ ...acc, [key]: '' }), {});

//KOMPONENT INPUTA
const FormInput = ({ label, name, value, onChange, onBlur, placeholder, type = "text", required, className = "", ...props }) => (
  <div className={`space-y-1 ${className}`}>
    <label className="text-[10px] font-bold text-appMuted uppercase tracking-wider pl-1">
      {label} {required && <span className="text-red-500 text-xs">*</span>}
    </label>
    <input 
      type={type} 
      name={name} 
      value={value} 
      onChange={onChange} 
      onBlur={onBlur}
      placeholder={placeholder} 
      required={required} 
      {...props}
      className="w-full px-3 py-2 text-sm bg-appInputBg text-appText border border-appBorder rounded-lg focus:border-appPrimary focus:bg-appCard outline-none transition-colors shadow-sm" 
    />
  </div>
);

export default function AddEquipmentPage() {
  const [formData, setFormData] = useState({
    type: 'laptop', manufacturer: '', model: '', ast_number: '', price: '', notes: '', status: 'private', 
    location: '1',
    isScrapped: false,
    noAst: false,
    specs: getEmptySpecs('laptop')
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (formData.manufacturer.trim().length > 1 && formData.model.trim().length > 2) {
        setIsLoadingSuggestions(true);
        try {
          const params = new URLSearchParams({ type: formData.type, manufacturer: formData.manufacturer.trim(), model: formData.model.trim() });
          const res = await authFetch(`/equipment/suggestions?${params.toString()}`);
          if (res.ok) setSuggestions(await res.json());
        } catch (err) {
          console.error('Błąd pobierania sugestii', err);
        } finally {
          setIsLoadingSuggestions(false);
        }
      } else {
        setSuggestions([]);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 800);
    return () => clearTimeout(timeoutId);
  }, [formData.type, formData.manufacturer, formData.model]);

  const getCompactSpecs = (item) => {
    if (formData.type === 'laptop') return [item.laptop_cpu, item.laptop_ram, item.laptop_disk].filter(Boolean).join(' | ');
    if (formData.type === 'computer') return [item.pc_cpu, item.pc_ram, item.pc_disk].filter(Boolean).join(' | ');
    if (formData.type === 'monitor') return [item.size, item.resolution].filter(Boolean).join(' | ');
    if (formData.type === 'switch') return `${item.ports_count || '?'} portów`;
    return '';
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFormData(prev => ({ ...prev, type: newType, specs: getEmptySpecs(newType), ast_number: '', noAst: false }));
  };

  const handlePriceChange = (e) => {
    const val = e.target.valueAsNumber;
    setFormData(prev => ({ ...prev, price: isNaN(val) ? '' : val }));
  };

  const handleSpecChange = (e) => {
    setFormData(prev => ({ ...prev, specs: { ...prev.specs, [e.target.name]: e.target.value } }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!value) return;

    let formattedValue = value.trim();

    switch (name) {
      case 'model':
        formattedValue = formattedValue.charAt(0).toUpperCase() + formattedValue.slice(1);
        break;
      case 'manufacturer':
        formattedValue = formattedValue.charAt(0).toUpperCase() + formattedValue.slice(1);
        if (formattedValue.length <= 2) {
          formattedValue = formattedValue.toUpperCase();
        }
        break;
      case 'ast_number':
        const digits = formattedValue.replace(/\D/g, ''); 
        if (digits) {
          formattedValue = `NRI${digits}`;
        } else {
          formattedValue = formattedValue.toUpperCase();
        }
        break;
      default:
        break;
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleSpecBlur = (e) => {
    const { name, value } = e.target;
    
    const formattedValue = formatHardwareSpec(value, name); 
    
    setFormData(prev => ({ 
      ...prev, 
      specs: { 
        ...prev.specs, 
        [name]: formattedValue 
      } 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.manufacturer || !formData.model || !formData.price) {
      toast.error('Wypełnij wszystkie wymagane pola!');
      return;
    }

    try {
      const res = await authFetch('/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success('Sprzęt został pomyślnie dodany do bazy!');
        
        // Reset po sukcesie
        setFormData({
          type: 'laptop', manufacturer: '', model: '', ast_number: '', price: '', notes: '', status: 'private', location: '1', isScrapped: false, noAst: false,
          specs: getEmptySpecs('laptop')
        });
      } else {
        const errorData = await res.json();
        toast.error(`Błąd: ${errorData.error || 'Nie udało się dodać sprzętu'}`);
      }
    } catch (err) {
      console.error('Błąd wysyłania do API:', err);
      toast.error('Błąd połączenia z serwerem');
    }
  };


  const generatePreviewItem = () => {
    const getLocationName = (id) => {
      if (id === '1') return 'Kraków';
      if (id === '2') return 'Warszawa';
      return 'Brak lokalizacji';
    };

    const baseItem = {
      type: formData.type,
      manufacturer: formData.manufacturer || 'Producent',
      model: formData.model || 'Model',
      price: formData.price ? Number(formData.price).toFixed(2) : '0.00',
      notes: formData.notes,
      location: getLocationName(formData.location),
      status: 'available', 
    };

    if (formData.type === 'laptop') return { ...baseItem, laptop_cpu: formData.specs.cpu, laptop_ram: formData.specs.ram, laptop_disk: formData.specs.disk, laptop_gpu: formData.specs.gpu };
    if (formData.type === 'computer') return { ...baseItem, pc_cpu: formData.specs.cpu, pc_ram: formData.specs.ram, pc_disk: formData.specs.disk, pc_gpu: formData.specs.gpu, case_type: formData.specs.case_type };
    if (formData.type === 'monitor') return { ...baseItem, size: formData.specs.size, resolution: formData.specs.resolution, panel_type: formData.specs.aspect_ratio };
    if (formData.type === 'switch') return { ...baseItem, ports_count: formData.specs.ports_count };
    return baseItem;
  };

  const isStrictlyAst = ['laptop', 'computer'].includes(formData.type);
  const canSkipAst = ['monitor', 'switch'].includes(formData.type);
  const isAstInputRequired = isStrictlyAst || (canSkipAst && !formData.noAst);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-appText flex items-center gap-2">
          <PlusCircle className="text-appPrimary" size={24}/> Dodaj nowy zasób
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="bg-appCard rounded-xl border border-appBorder shadow-sm overflow-hidden transition-colors duration-300">
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
            
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-appText border-b border-appBorder pb-2 flex items-center gap-2">
                <LayoutGrid size={16} className="text-appPrimary"/> Podstawowe dane
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center h-5 px-1">
                    <label className="text-[10px] font-bold text-appMuted uppercase tracking-wider">
                      Rodzaj sprzętu <span className="text-red-500 text-xs">*</span>
                    </label>
                  </div>
                  <select name="type" value={formData.type} onChange={handleTypeChange} className="w-full px-3 py-2 text-sm bg-appInputBg text-appText border border-appBorder rounded-lg focus:border-appPrimary focus:bg-appCard outline-none cursor-pointer shadow-sm">
                    <option value="laptop">Laptop</option>
                    <option value="computer">Komputer stacjonarny</option>
                    <option value="monitor">Monitor</option>
                    <option value="switch">Sieć (Switch)</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center h-5 px-1">
                    <label className="text-[10px] font-bold text-appMuted uppercase tracking-wider">
                      NRI (Numer inwentarzowy) {isAstInputRequired && <span className="text-red-500 text-xs">*</span>}
                    </label>
                    {canSkipAst && (
                      <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-appMuted hover:text-appText transition-colors">
                        <input 
                          type="checkbox" name="noAst" checked={formData.noAst}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setFormData(prev => ({ ...prev, noAst: isChecked, ast_number: isChecked ? '' : prev.ast_number, isScrapped: isChecked ? false : prev.isScrapped }));
                          }}
                          className="w-3 h-3 rounded border-appBorder text-appPrimary focus:ring-appPrimary cursor-pointer" 
                        />
                        Brak NRI
                      </label>
                    )}
                  </div>
                  <input 
                    type="text" name="ast_number" value={formData.ast_number} onChange={handleChange} onBlur={handleBlur}
                    placeholder="np. NRI1942" disabled={canSkipAst && formData.noAst} required={isAstInputRequired} 
                    className="w-full px-3 py-2 text-sm bg-appInputBg text-appText border border-appBorder rounded-lg focus:border-appPrimary focus:bg-appCard outline-none transition-colors shadow-sm disabled:bg-appInputBg/50 disabled:text-appMuted disabled:cursor-not-allowed" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <FormInput label="Producent" name="manufacturer" value={formData.manufacturer} onChange={handleChange} onBlur={handleBlur} placeholder="np. Dell" required />
                <FormInput label="Model" name="model" value={formData.model} onChange={handleChange} onBlur={handleBlur} placeholder="np. Latitude E7470" required />
              </div>
              
              {/* Cena i lokalizacja */}
              <div className="grid grid-cols-2 gap-3 relative">
                <div className="relative">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-appMuted uppercase tracking-wider pl-1">
                      Wycena (PLN) <span className="text-red-500 text-xs">*</span>
                    </label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0"
                      name="price" 
                      value={formData.price} 
                      onChange={handlePriceChange} 
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => {
                        setTimeout(() => setShowSuggestions(false), 200);
                      }}
                      placeholder="np. 200.00" 
                      required 
                      className="w-full px-3 py-2 text-sm bg-appInputBg text-appText border border-appBorder rounded-lg focus:border-appPrimary focus:bg-appCard outline-none transition-colors shadow-sm" 
                    />
                  </div>
                  
                  {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
                    <div className="absolute top-[105%] left-0 w-full sm:w-[200%] z-20 mt-1 bg-amber-500/10 backdrop-blur-md border border-amber-500/20 rounded-xl p-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
                      <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <Lightbulb size={12} className={isLoadingSuggestions ? "animate-pulse" : ""} />
                        {isLoadingSuggestions ? 'Szukam podobnych wycen...' : 'Sugerowane wyceny'}
                      </h4>
                      {!isLoadingSuggestions && (
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                          {suggestions.map(sug => (
                            <div 
                              key={sug.id} 
                              onClick={() => {
                                setFormData(prev => ({ ...prev, price: sug.price }));
                                setShowSuggestions(false);
                              }} 
                              className="flex items-center justify-between gap-3 p-2 bg-appCard border border-amber-500/20 rounded-lg cursor-pointer hover:bg-amber-500/20 hover:border-amber-500/50 transition-colors group" 
                              title="Kliknij, aby użyć tej ceny"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-appText truncate group-hover:text-amber-500 transition-colors">{formData.manufacturer} {formData.model}</p>
                                <p className="text-[10px] text-appMuted truncate mt-0.5">{getCompactSpecs(sug) || 'Brak dokładnej specyfikacji'}</p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0 bg-amber-500/20 text-amber-600 px-2 py-1 rounded-md border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                <Tag size={12} className="opacity-70" />
                                <span className="text-xs font-bold whitespace-nowrap">{Number(sug.price).toFixed(2)} zł</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center h-5 px-1">
                    <label className="text-[10px] font-bold text-appMuted uppercase tracking-wider">
                      Lokalizacja <span className="text-red-500 text-xs">*</span>
                    </label>
                  </div>
                  <select 
                    name="location" 
                    value={formData.location} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 text-sm bg-appInputBg text-appText border border-appBorder rounded-lg focus:border-appPrimary focus:bg-appCard outline-none cursor-pointer shadow-sm"
                  >
                    <option value="1">Kraków</option>
                    <option value="2">Warszawa</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-appMuted uppercase tracking-wider pl-1">Komentarz (opcjonalny)</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="np. Pęknięta dolna obudowa..." className="w-full px-3 py-2 text-sm bg-appInputBg text-appText border border-appBorder rounded-lg focus:border-appPrimary focus:bg-appCard outline-none resize-y min-h-22.5 max-h-31.75 shadow-sm" />
              </div>
            </div>

            {/* Specyfikacja */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-appText border-b border-appBorder pb-2 flex items-center gap-2">
                <Settings2 size={16} className="text-appPrimary"/> Specyfikacja techniczna
              </h3>

              <div className="bg-appInputBg/50 border border-appBorder rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(SPECS_CONFIG[formData.type]).map(([key, [label, placeholder]]) => (
                  <FormInput 
                    key={key} 
                    label={label} 
                    name={key} 
                    value={formData.specs[key] || ''} 
                    onChange={handleSpecChange} 
                    onBlur={handleSpecBlur}
                    placeholder={placeholder} 
                    required 
                  />
                ))}
              </div>
              <div className="pt-1 select-none">
                <label className={`flex items-start gap-3 p-3 border rounded-xl transition-colors ${
                  formData.noAst ? 'border-appBorder bg-appInputBg/50 cursor-not-allowed' : 'border-appBorder cursor-pointer hover:border-red-500/50 hover:bg-red-500/10 group'
                }`}>
                  <input 
                    type="checkbox" name="isScrapped" checked={formData.isScrapped} onChange={handleChange} disabled={formData.noAst} 
                    className="mt-0.5 w-4 h-4 border-2 border-appBorder rounded accent-red-600 focus:ring-red-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50" 
                  />
                  <div className="flex flex-col">
                    <span className={`text-sm font-semibold transition-colors ${formData.noAst ? 'text-appMuted' : 'text-appText group-hover:text-red-500'}`}>Zezłomowany w CMMS?</span>
                    <span className="text-[10px] text-appMuted mt-0.5 flex flex-col">
                      <span>Zaznacz, jeżeli sprzęt jest już zezłomowany (wyłączony z obiegu).</span>
                      <span className={`block text-red-500 font-bold mt-1 ${formData.noAst ? 'visible' : 'invisible'}`}>
                        ZABLOKOWANE: Sprzęt bez NRI nie wymaga złomowania.
                      </span>
                    </span>
                  </div>
                </label>
              </div>


              {/* informacja */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3 shadow-sm">
                <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-appText font-medium leading-relaxed">
                  <span className="font-bold uppercase tracking-wide text-blue-500 block mb-1">Informacja o statusie</span>
                  Każdy nowo dodany sprzęt otrzymuje automatycznie status <strong>Prywatny</strong>. Aby wystawić go na sprzedaż, zmień status w zakładce Zasoby.
                </p>
              </div>
            </div>

            {/* Live Preview */}
            <div className="space-y-4 bg-appInputBg/30 rounded-xl p-4 border border-appBorder flex flex-col items-center xl:items-start">
              <h3 className="text-sm font-bold text-appText pb-2 flex items-center gap-2 w-full">
                <Eye size={16} className="text-appPrimary"/> Podgląd karty
              </h3>
              
              <div className="w-full max-w-[320px] pointer-events-none origin-top">
                <EquipmentCard item={generatePreviewItem()} onReserve={() => {}} />
              </div>
            </div>

          </div>
        </div>

        <div className="bg-appInputBg/50 px-5 py-4 flex justify-end border-t border-appBorder">
          <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-appPrimary text-white rounded-lg font-bold text-sm shadow-sm hover:bg-appSecondary transition-all active:scale-95">
            <Save size={16} /> Zapisz w bazie
          </button>
        </div>
      </form>
    </div>
  );
}