import { useState, useEffect } from 'react';
import { Search, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { authFetch } from '../../api';

//Komponenty i Hooki
import EquipmentStatusModal from '../../components/EquipmentStatusModal';
import InventoryFilters from '../../components/InventoryFilters';
import InventoryTable from '../../components/InventoryTable';
import useSortableData from '../../hooks/useSortableData';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Stany filtrów
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterScrapped, setFilterScrapped] = useState('all');

  // Stan modala
  const [editingItem, setEditingItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/equipment'); 
      if (res.ok) setItems(await res.json());
      else toast.error('Błąd pobierania danych.');
    } catch (err) {
      toast.error('Błąd połączenia z serwerem.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if(!confirm('Czy na pewno chcesz trwale usunąć ten sprzęt z bazy?')) return;
    try {
      const res = await authFetch(`/equipment/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Sprzęt usunięty.');
        fetchData();
      } else toast.error('Błąd usuwania.');
    } catch (e) {
      toast.error('Błąd serwera.');
    }
  };

  //FILTROWANIE
  const filteredItems = items.filter(item => {
    if (search) {
      const searchTerms = search.toLowerCase().split(' ').filter(Boolean);
      const searchableString = JSON.stringify(item).toLowerCase();
      if (!searchTerms.every(term => searchableString.includes(term))) return false;
    }
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterScrapped === 'yes' && (!item.ast_number || !item.is_scrapped)) return false;
    if (filterScrapped === 'no' && (!item.ast_number || item.is_scrapped)) return false;
    if (filterScrapped === 'na' && item.ast_number) return false;
    return true;
  });

  //SORTOWANIE
  const { sortedItems, sortConfig, requestSort, clearSort } = useSortableData(filteredItems);

  return (
    <div className="space-y-6">
      
      {/* HEADER*/}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-appText flex items-center gap-2">
          <Package className="text-appPrimary" size={24} /> Lista zasobów
        </h1>
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-appMuted" size={18} />
          <input 
            className="w-full pl-10 pr-4 py-2 bg-appInputBg text-appText border border-appBorder rounded-xl text-sm outline-none focus:border-appPrimary focus:ring-2 focus:ring-appFocusRing transition-all shadow-sm" 
            placeholder="Szukaj..." 
            value={search} onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </header>

      {/* FILTRY */}
      <InventoryFilters 
        filterType={filterType} setFilterType={setFilterType}
        filterStatus={filterStatus} setFilterStatus={setFilterStatus}
        filterScrapped={filterScrapped} setFilterScrapped={setFilterScrapped}
        sortConfig={sortConfig} clearSort={clearSort}
      />

      {/* TABELA */}
      <InventoryTable 
        items={sortedItems}
        loading={loading}
        sortConfig={sortConfig}
        requestSort={requestSort}
        onEdit={setEditingItem}
        onDelete={handleDelete}
      />

      {/* MODAL EDYCJI */}
      <EquipmentStatusModal 
        isOpen={!!editingItem} 
        item={editingItem} 
        onClose={() => setEditingItem(null)} 
        onSaved={() => { setEditingItem(null); fetchData(); }} 
      />
    </div>
  );
}