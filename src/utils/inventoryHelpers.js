import toast from 'react-hot-toast';

export const getSpecsSummary = (item) => {
  const cpu = item.cpu || item.laptop_cpu || item.pc_cpu || '-';
  const ram = item.ram || item.laptop_ram || item.pc_ram || '-';
  const disk = item.disk || item.laptop_disk || item.pc_disk || '-';
  const gpu = item.gpu || item.laptop_gpu || item.pc_gpu || '-';
  
  if (item.type === 'laptop' || item.type === 'computer') {
    let specs = `${cpu} / ${ram} / ${disk}`;
    if (gpu !== '-') specs += ` / ${gpu}`;
    return specs;
  }
  
  if (item.type === 'monitor') {
    return `${item.size || '-'} / ${item.resolution || '-'}`;
  }
  
  if (item.type === 'switch') {
    return `${item.ports_count ? item.ports_count + ' portów' : '-'}`;
  }
  
  return '-';
};

export const getStatusInfo = (status) => {
  switch(status) {
    case 'available': return { label: 'Dostępny', color: 'text-emerald-600' };
    case 'reserved': return { label: 'Zarezerwowany', color: 'text-amber-600' };
    case 'issued_tested': return { label: 'Wydany / Testowany', color: 'text-blue-700' };
    case 'sold': return { label: 'Sprzedany / Rozliczony', color: 'text-red-600 line-through' };
    case 'private': return { label: 'Prywatny', color: 'text-purple-800' };
    default: return { label: status, color: 'text-slate-500' };
  }
};

export const handleCopyAST = (astNumber) => {
  if (!astNumber) return;
  
  navigator.clipboard.writeText(astNumber)
    .then(() => {
      toast.success(`Skopiowano: ${astNumber}`, {
        style: {
          borderRadius: '10px',
          background: '#FFF',
          color: '#333',
        },
      });
    })
    .catch(err => {
      console.error('Błąd kopiowania:', err);
      toast.error('Nie udało się skopiować');
    });
};

export const sortLabels = {
  equipment: 'SPRZĘT',
  status: 'STATUS',
  added_by: 'DODANE PRZEZ'
};