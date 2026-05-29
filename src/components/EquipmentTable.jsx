import { Laptop, Monitor, PcCase, Network } from 'lucide-react';

export default function EquipmentTable({ items, onReserve }) {

  const typeIcons = {
    laptop: Laptop,
    monitor: Monitor,
    computer: PcCase,
    switch: Network
  };

  const typeLabels = {
    laptop: 'Laptop',
    computer: 'Komputer',
    monitor: 'Monitor',
    switch: 'Switch'
  };

  const renderFullSpecs = (item) => {
    const specs = [];
    if (item.type === 'laptop') {
      if (item.laptop_cpu) specs.push({ label: 'CPU', value: item.laptop_cpu });
      if (item.laptop_ram) specs.push({ label: 'RAM', value: item.laptop_ram });
      if (item.laptop_disk) specs.push({ label: 'Dysk', value: item.laptop_disk });
      if (item.laptop_gpu) specs.push({ label: 'GPU', value: item.laptop_gpu });
    } else if (item.type === 'computer') {
      if (item.pc_cpu) specs.push({ label: 'CPU', value: item.pc_cpu });
      if (item.pc_ram) specs.push({ label: 'RAM', value: item.pc_ram });
      if (item.pc_gpu) specs.push({ label: 'GPU', value: item.pc_gpu });
      if (item.pc_disk) specs.push({ label: 'Dysk', value: item.pc_disk });
      if (item.case_type) specs.push({ label: 'Obudowa', value: item.case_type });
    } else if (item.type === 'monitor') {
      if (item.size) specs.push({ label: 'Rozmiar', value: item.size });
      if (item.resolution) specs.push({ label: 'Rozdzielczość', value: item.resolution });
      if (item.panel_type) specs.push({ label: 'Matryca', value: item.panel_type });
    } else if (item.type === 'switch') {
      if (item.ports_count) specs.push({ label: 'Porty', value: `${item.ports_count}x` });
      if (item.speed) specs.push({ label: 'Prędkość', value: item.speed });
    }

    return (
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {specs.map((s, index) => (
          <div key={index} className="flex items-center text-[13px]">
            <span className="text-appMuted font-bold mr-1">{s.label}:</span>
            <span className="text-appText/90">{s.value}</span>
            {index < specs.length - 1 && <span className="ml-3 text-appBorder">|</span>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-appBorder bg-appCard backdrop-blur-md shadow-md font-sans">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-appBorder bg-appInputBg">
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-appMuted font-poppins">Sprzęt</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-appMuted font-poppins">Specyfikacja</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-appMuted font-poppins text-right">Cena</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-appMuted font-poppins text-center">Status</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-appMuted font-poppins text-right">Akcja</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-appBorder">
          {items.map((item, index) => {
            const isAvailable = item.status === 'available';
            const IconComponent = typeIcons[item.type];
            
            return (
              <tr key={`${item.id}-${index}`} className="hover:bg-appInputBg">
                <td className="px-6 py-5">
                  <div className="flex flex-col items-start gap-2">
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-appPrimary">
                      <IconComponent size={14} strokeWidth={2} />
                      {typeLabels[item.type] || item.type}
                    </span>
                    <div className="text-sm font-bold text-appText group-hover:text-appPrimary transition-colors">
                      {item.manufacturer} {item.model}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-5">
                  {renderFullSpecs(item)}
                  {item.notes && (
                    <div className="mt-1 text-[11px] text-appMuted italic truncate max-w-xs pl-3 border-l-2 border-appPrimary/30">
                        {item.notes}
                    </div>
                  )}
                </td>

                <td className="px-6 py-5 text-right whitespace-nowrap">
                  <span className="text-lg font-black text-appText font-poppins">{item.price}</span>
                  <span className="text-[10px] font-bold text-appMuted ml-1">PLN</span>
                </td>

                <td className="px-6 py-5 text-center">
                  <span className={`inline-block px-2.5 py-1 text-xs font-black ${
                    isAvailable 
                      ? 'text-green-500'
                      : item.status === 'reserved'
                      ? 'text-red-500'
                      : 'bg-appInputBg text-appMuted border-appBorder'
                  }`}>
                    {item.status === 'available' ? 'DOSTĘPNY' : item.status === 'reserved' ? 'REZERWACJA' : 'SPRZEDANE'}
                  </span>
                </td>

                <td className="px-6 py-5 text-right">
                  {isAvailable ? (
                    <button 
                      onClick={() => onReserve(item)}
                      className="bg-appPrimary hover:bg-appSecondary text-white px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 shadow-sm hover:shadow-appPrimary/20"
                    >
                      Rezerwuj
                    </button>
                  ) : (
                    <span className="bg-appInputBg text-appMuted px-4 py-2 rounded-xl text-xs font-black border border-appBorder cursor-not-allowed">Niedostępny</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}