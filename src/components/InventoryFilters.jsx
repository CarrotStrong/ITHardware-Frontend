import { Filter, ChevronDown, X } from 'lucide-react';
import { sortLabels } from '../utils/inventoryHelpers';

export default function InventoryFilters({
  filterType, setFilterType,
  filterStatus, setFilterStatus,
  filterScrapped, setFilterScrapped,
  sortConfig, clearSort
}) {
  return (
    <div className="bg-appCard p-4 rounded-2xl border border-appBorder shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 transition-colors duration-300">
      <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
        <div className="flex items-center gap-2 text-appMuted font-bold text-sm shrink-0 md:ml-2">
          <Filter size={18} /> Filtruj:
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="appearance-none w-full sm:w-auto pl-3 pr-9 py-1.5 border border-appBorder rounded-lg text-sm outline-none bg-appInputBg text-appText focus:border-appPrimary cursor-pointer transition-colors">
              {/* Dodano klasy do <option> */}
              <option className="bg-appBg text-appText" value="all">Wszystkie typy</option>
              <option className="bg-appBg text-appText" value="laptop">Laptopy</option>
              <option className="bg-appBg text-appText" value="computer">Komputery</option>
              <option className="bg-appBg text-appText" value="monitor">Monitory</option>
              <option className="bg-appBg text-appText" value="switch">Switche</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-appMuted pointer-events-none" />
          </div>

          <div className="relative w-full sm:w-auto">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="appearance-none w-full sm:w-auto pl-3 pr-9 py-1.5 border border-appBorder rounded-lg text-sm outline-none bg-appInputBg text-appText focus:border-appPrimary cursor-pointer transition-colors">
              <option className="bg-appBg text-appText" value="all">Wszystkie statusy</option>
              <option className="bg-appBg text-appText" value="available">Dostępny</option>
              <option className="bg-appBg text-appText" value="reserved">Zarezerwowany</option>
              <option className="bg-appBg text-appText" value="issued_tested">Wydany / Testowany</option>
              <option className="bg-appBg text-appText" value="sold">Sprzedany / Rozliczony</option>
              <option className="bg-appBg text-appText" value="private">Prywatny</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-appMuted pointer-events-none" />
          </div>

          <div className="relative w-full sm:w-auto">
            <select value={filterScrapped} onChange={e => setFilterScrapped(e.target.value)} className="appearance-none w-full sm:w-auto pl-3 pr-9 py-1.5 border border-appBorder rounded-lg text-sm outline-none bg-appInputBg text-appText focus:border-appPrimary cursor-pointer transition-colors">
              <option className="bg-appBg text-appText" value="all">Stan złomowania (Wszystko)</option>
              <option className="bg-appBg text-appText" value="yes">Tylko zezłomowane</option>
              <option className="bg-appBg text-appText" value="no">W obiegu (niezezłomowane)</option>
              <option className="bg-appBg text-appText" value="na">Nie dotyczy (Brak NRI)</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-appMuted pointer-events-none" />
          </div>
        </div>
      </div>

      {sortConfig.key && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-appInputBg border border-appBorder rounded-lg text-[11px] font-bold uppercase tracking-wider animate-in fade-in shrink-0 transition-colors">
          <span className="text-appMuted">Sortowanie:</span>
          <span className="text-appText">{sortLabels[sortConfig.key]}</span>
          <button 
            onClick={clearSort} 
            className="flex items-center justify-center p-0.5 ml-1 text-appMuted hover:text-appText hover:bg-appBorder rounded-full transition-all focus:outline-none" 
            title="Wyczyść sortowanie"
          >
            <X size={13} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}