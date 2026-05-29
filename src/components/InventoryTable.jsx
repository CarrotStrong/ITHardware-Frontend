import { Check, X, Copy, Edit2, Trash2, ChevronsUpDown, ChevronUp, ChevronDown, MapPin } from 'lucide-react';
import { getSpecsSummary, getStatusInfo, handleCopyAST } from '../utils/inventoryHelpers';
import { getLocationLabel } from '../utils/locationLabels';

export default function InventoryTable({ items, loading, sortConfig, requestSort, onEdit, onDelete }) {
  
  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ChevronsUpDown size={14} className="text-appMuted ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />;
    if (sortConfig.direction === 'asc') return <ChevronUp size={14} className="text-appPrimary ml-1" />;
    return <ChevronDown size={14} className="text-appPrimary ml-1" />;
  };

  return (
    <div className="bg-appCard border border-appBorder rounded-2xl overflow-hidden shadow-sm transition-colors duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-appInputBg/80 text-appMuted font-bold uppercase text-[10px] tracking-widest border-b border-appBorder">
            <tr>
              <th className="px-4 py-4 cursor-pointer group select-none transition-colors hover:bg-appInputBg" onClick={() => requestSort('equipment')}>
                <div className="flex items-center">Sprzęt / NRI <SortIcon columnKey="equipment" /></div>
              </th>
              <th className="px-4 py-4">Specyfikacja</th>
              <th className="px-4 py-4">Lokalizacja</th>
              <th className="px-4 py-4 cursor-pointer group select-none transition-colors hover:bg-appInputBg" onClick={() => requestSort('status')}>
                <div className="flex items-center">Status <SortIcon columnKey="status" /></div>
              </th>
              <th className="px-4 py-4 cursor-pointer group select-none transition-colors hover:bg-appInputBg" onClick={() => requestSort('added_by')}>
                <div className="flex items-center">Dodane przez <SortIcon columnKey="added_by" /></div>
              </th>
              <th className="px-4 py-4 text-center">
                <div className="flex items-center justify-center">Zezłomowany?</div>
              </th>
              <th className="px-4 py-4 text-right">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {loading && items.length === 0 ? (
              <tr><td colSpan="7" className="px-6 py-12 text-center text-appMuted">Ładowanie danych...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="7" className="px-6 py-12 text-center text-appMuted">Brak wyników dla podanych filtrów.</td></tr>
            ) : (
              items.map(item => {
                const statusInfo = getStatusInfo(item.status);
                return (
                <tr key={item.id} className="border-b border-appBorder last:border-none hover:bg-appInputBg/50 transition-colors group">
                  <td className="px-4 py-4">
                    <div className={`font-bold text-appText ${item.status === 'sold' ? 'opacity-50' : ''}`}>
                      {item.manufacturer} {item.model}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] uppercase font-bold text-appMuted tracking-wider">
                        {item.type}
                      </span>
                      {item.ast_number && (
                        <span 
                          onClick={() => handleCopyAST(item.ast_number)}
                          className="group/ast flex items-center gap-1.5 text-xs bg-appPrimary hover:bg-appSecondary text-white px-2 py-1 rounded border border-appPrimary/50 font-bold cursor-pointer transition-all active:scale-95"
                          title="Kliknij, aby skopiować"
                        >
                          {item.ast_number}
                          <Copy size={12} className="opacity-60 group-hover/ast:opacity-100 transition-opacity" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-appMuted text-xs font-medium">
                    {getSpecsSummary(item)}
                    {item.price && <div className="mt-1 text-[10px] font-bold text-appPrimary">{Number(item.price).toFixed(2)} PLN</div>}
                  </td>
                  <td className="px-4 py-4">
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-appText/70 bg-appInputBg px-2.5 py-1 rounded-md border border-appBorder">
                      <MapPin size={12} className="text-appMuted shrink-0" />
                      <span>{getLocationLabel(item.location)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-[10px] uppercase tracking-wider font-bold ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-appMuted font-medium">
                    {item.added_by || 'System'}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {!item.ast_number ? (
                      <span className="text-appMuted opacity-50 text-[10px] font-bold uppercase">Nie dotyczy</span>
                    ) : item.is_scrapped ? (
                      <div className="flex justify-center" title="Zezłomowany w CMMS">
                        <Check size={22} strokeWidth={3} className="text-emerald-500 drop-shadow-sm" />
                      </div>
                    ) : (
                      <div className="flex justify-center" title="W obiegu (Niezezłomowany)">
                        <X size={22} strokeWidth={3} className="text-red-500 drop-shadow-sm" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onEdit(item)} className="p-2 text-appMuted hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all" title="Edytuj sprzęt">
                        <Edit2 size={18}/>
                      </button>
                      <button onClick={() => onDelete(item.id)} className="p-2 text-appMuted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Usuń trwale">
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </td>
                </tr>
              )})
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}