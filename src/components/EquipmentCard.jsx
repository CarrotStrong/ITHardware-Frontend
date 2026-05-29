import { Laptop, Monitor, PcCase, Network, Cpu, MemoryStick, HardDrive, Gpu, Proportions, ScreenShare, EthernetPort, Ratio, MapPin } from 'lucide-react';
import { getSpecTooltipInfo } from '../utils/equipmentTooltips';
import { getLocationLabel } from '../utils/locationLabels';
import logoSmall from '../assets/logo-bg2.png';

export default function EquipmentCard({ item, onReserve }) {
  const isAvailable = item.status === 'available';

  const typeIcons = { laptop: Laptop, monitor: Monitor, computer: PcCase, switch: Network };
  const typeLabels = { laptop: 'LAPTOP', computer: 'KOMPUTER', monitor: 'MONITOR', switch: 'SWITCH' };

  const getSpecs = () => {
    const specs = [];
    if (item.type === 'laptop') {
      if (item.laptop_cpu) specs.push({ icon: Cpu, label: item.laptop_cpu, specType: 'cpu' });
      if (item.laptop_ram) specs.push({ icon: MemoryStick, label: item.laptop_ram, specType: 'ram' });
      if (item.laptop_disk) specs.push({ icon: HardDrive, label: item.laptop_disk, specType: 'disk' });
      if (item.laptop_gpu) specs.push({ icon: Gpu, label: item.laptop_gpu, specType: 'gpu' });
    } 
    else if (item.type === 'computer') {
      if (item.pc_cpu) specs.push({ icon: Cpu, label: item.pc_cpu, specType: 'cpu' });
      if (item.pc_ram) specs.push({ icon: MemoryStick, label: item.pc_ram, specType: 'ram' });
      if (item.pc_disk) specs.push({ icon: HardDrive, label: item.pc_disk, specType: 'disk' });
      if (item.pc_gpu) specs.push({ icon: Gpu, label: item.pc_gpu, specType: 'gpu' });
      if (item.case_type)   specs.push({ icon: PcCase, label: item.case_type, specType: 'case' });
    } 
    else if (item.type === 'monitor') {
      if (item.size) specs.push({ icon: ScreenShare, label: item.size, specType: 'size' });
      if (item.resolution) specs.push({ icon: Proportions, label: item.resolution, specType: 'resolution' });
      if (item.aspect_ratio) specs.push({ icon: Ratio, label: item.aspect_ratio, specType: 'aspect_ratio' });
    } 
    else if (item.type === 'switch') {
      if (item.ports_count) specs.push({ icon: EthernetPort, label: `${item.ports_count} portów`, specType: 'ports' });
    }

    return specs;
  };
  
  const specsList = getSpecs();
  const IconComponent = typeIcons[item.type];

  return (
    <div className="group relative flex flex-col h-full rounded-2xl border border-appBorder bg-appCard shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-appCard/90 overflow-hidden">
      
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-2xl">
        <img 
          src={logoSmall} 
          alt="" 
          className="absolute right-0 bottom-0 h-[145%] w-auto object-contain opacity-4 grayscale -rotate-12 select-none translate-x-1/3 translate-y-1/6" 
        />
      </div>

      <div className="p-6 flex flex-col grow relative z-10">
        <div className="flex items-start justify-between mb-4">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest pt-1 text-appPrimary cursor-default">
            <IconComponent size={14} strokeWidth={2} />{typeLabels[item.type]}
          </span>
          {!isAvailable && (
            <span className={`inline-block px-2.5 py-1 text-xs tracking-widest font-black cursor-default ${
                      item.status === 'reserved'
                      ? 'text-red-500'
                      : 'bg-appInputBg text-appMuted border-appBorder'
                  }`}>
                    {item.status === 'reserved' ? 'REZERWACJA' : 'SPRZEDANE'}
            </span>
          )}
        </div>

        <h3 className="font-bold text-lg text-appText mb-1 leading-tight relative cursor-default">
          {item.manufacturer} {item.model}
        </h3>
        <span className="flex max-w-max items-center gap-1 text-[10px] text-appMuted uppercase tracking-widest mb-6 cursor-default">
          <MapPin size={12} strokeWidth={2.0} />
          {getLocationLabel(item.location)}
        </span>

        <div className="mb-5 grow relative">
          {specsList.length > 0 ? (
            <ul className="space-y-1.5 relative z-10">
              {specsList.map((specItem, index) => {
                const Icon = specItem.icon;
                const { iconTooltip, textTooltip } = getSpecTooltipInfo(specItem.specType, specItem.label);
                
                return (
                  <li key={index} className="flex items-center text-sm text-appText/80 mb-1.5">
                    <div 
                      className="mr-2.5 shrink-0 text-appMuted hover:text-appPrimary transition-colors cursor-help" 
                      title={iconTooltip}
                    >
                      <Icon size={16} strokeWidth={1.8} />
                    </div>
                    <span 
                      className={`leading-tight ${
                        textTooltip 
                          ? 'cursor-help border-b border-dashed border-transparent hover:border-appPrimary transition-colors' 
                          : ''
                      }`}
                      title={textTooltip || undefined}
                    >
                      {specItem.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-appMuted italic relative z-10">Brak szczegółów</p>
          )}
        </div>

        {item.notes && (
          <div className="mb-5 text-xs text-appMuted italic pl-3 border-l-2 border-appPrimary/30 relative z-10">
            {item.notes}
          </div>
        )}

        <div className="pt-4 mt-auto border-t border-appBorder flex items-center justify-between relative z-10">
          <div>
            <span className="text-2xl font-bold text-appText tracking-tight">{item.price}</span>
            <span className="text-xs font-medium text-appMuted ml-1">PLN</span>
          </div>

          {isAvailable ? (
            <button 
              onClick={() => onReserve(item)}
              className="bg-appPrimary hover:bg-appSecondary text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
            >
              Rezerwuj
            </button>
          ) : (
               <button disabled className="bg-appInputBg text-appMuted px-5 py-2.5 rounded-xl text-sm font-medium border border-appBorder cursor-not-allowed">
                 Niedostępny
               </button>
          )}
        </div>
      </div>
    </div>
  );
}