import { Search } from 'lucide-react';

export default function AsideFilter({ 
  search, 
  setSearch, 
  category, 
  setCategory
}) {
  
  const categories = [
    { id: 'all', label: 'Wszystko' },
    { id: 'laptop', label: 'Laptopy' },
    { id: 'computer', label: 'Komputery' },
    { id: 'monitor', label: 'Monitory' },
    { id: 'switch', label: 'Sieć' },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      <div className="sticky top-[7.5rem] rounded-2xl border border-appBorder bg-appCard backdrop-blur-md p-6 shadow-md transition-all hover:shadow-lg">

        <div className="mb-8">
          <label className="text-[11px] font-bold text-appMuted uppercase tracking-widest mb-2 block">
            Wyszukaj
          </label>
          <div className="relative group">
            <Search 
              size={16} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-appMuted group-focus-within:text-appPrimary transition-colors" 
            />
            <input 
              type="text" 
              placeholder="np. latitude E7470" 
              className="w-full border border-appBorder bg-appInputBg text-appText px-4 py-2.5 pl-10 rounded-xl focus:ring-2 focus:ring-appFocusRing focus:border-appPrimary outline-none transition text-sm placeholder-appMuted shadow-inner"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-appMuted mb-3">
            Kategorie
          </h3>
          <div className="flex flex-col space-y-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`text-left px-3 py-2 rounded-lg text-sm transition font-medium relative flex items-center cursor-pointer ${
                  category === cat.id 
                    ? 'text-appPrimary bg-appPrimary/10 font-bold' 
                    : 'text-appText/80 hover:bg-appInputBg hover:text-appText'
                }`}
              >
                {category === cat.id && (
                  <span className="absolute left-0 h-4 w-1 bg-appPrimary rounded-r-full animate-in fade-in slide-in-from-left-1"></span>
                )}
                <span className={category === cat.id ? 'ml-2' : ''}>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}