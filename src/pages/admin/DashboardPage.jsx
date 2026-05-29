import { useState, useEffect } from 'react';
import { Package, Laptop, DollarSign, ChartNoAxesCombined, TrendingUp } from 'lucide-react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';
import { authFetch } from '../../api';

export default function DashboardPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await authFetch('/equipment');
        if (res.ok) {
          setItems(await res.json());
        } else {
          toast.error('Błąd pobierania danych do statystyk');
        }
      } catch (err) {
        toast.error('Błąd serwera');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // OBLICZENIA STATYSTYK
  const totalValue = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  
  const availableCount = items.filter(i => (i.status || '').trim() === 'available').length;
  
  // Zysk ze sprzedanych
  const totalSales = items
    .filter(i => (i.status || '').trim() === 'sold')
    .reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  
  // ZLICZANIE STATUSÓW DO WYKRESU
  const statusCounts = {};
  items.forEach(item => {
    const status = String(item.status || 'available').trim(); 
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  // TUTAJ ZMIANA: Zastępujemy sztywne HEXy naszymi nowymi zmiennymi wykresów
  const styleMap = {
    'available': { name: 'Dostępne', fill: 'var(--theme-chart-green)' },
    'issued_tested': { name: 'Wydane/Testowane', fill: 'var(--theme-chart-blue)' },
    'reserved': { name: 'Zarezerwowane', fill: 'var(--theme-chart-amber)' },
    'sold': { name: 'Sprzedane', fill: 'var(--theme-chart-red)' },
    'private': { name: 'Prywatne', fill: 'var(--theme-chart-purple)' }
  };

  const statusData = Object.keys(statusCounts).map(key => ({
    name: styleMap[key]?.name || key,
    value: statusCounts[key],
    fill: styleMap[key]?.fill || 'var(--theme-muted)'
  }));

  const typeData = [
    { name: 'Laptopy', count: items.filter(i => String(i.type || '').trim() === 'laptop').length },
    { name: 'Komputery PC', count: items.filter(i => String(i.type || '').trim() === 'computer').length },
    { name: 'Monitory', count: items.filter(i => String(i.type || '').trim() === 'monitor').length },
    { name: 'Switche', count: items.filter(i => String(i.type || '').trim() === 'switch').length }
  ];

  if (loading) return <div className="p-6 text-appMuted">Ładowanie statystyk...</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-appText flex items-center gap-2">
          <ChartNoAxesCombined className="text-appPrimary" size={24}/> Statystyki
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Całkowita ilość */}
        <div className="bg-appCard p-6 rounded-2xl border border-appBorder shadow-sm flex items-center gap-4 transition-colors duration-300">
          <div className="p-4 text-appPrimary">
            <Package size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-appMuted uppercase tracking-wider">Łącznie dodany sprzęt</p>
            <p className="text-2xl font-black text-appText">{items.length}</p>
          </div>
        </div>

        {/* Dostępne */}
        <div className="bg-appCard p-6 rounded-2xl border border-appBorder shadow-sm flex items-center gap-4 transition-colors duration-300">
          <div className="p-4 text-appPrimary">
            <Laptop size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-appMuted uppercase tracking-wider">Aktualnie w sprzedaży</p>
            <p className="text-2xl font-black text-appText">{availableCount}</p>
          </div>
        </div>

        {/* Wartość */}
        <div className="bg-appCard p-6 rounded-2xl border border-appBorder shadow-sm flex items-center gap-4 transition-colors duration-300">
          <div className="p-4 text-appPrimary">
            <DollarSign size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-appMuted uppercase tracking-wider">Wartość sprzętu</p>
            <p className="text-2xl font-black text-appText">{totalValue.toLocaleString('pl-PL')} <span className="text-sm font-semibold text-appMuted">PLN</span></p>
          </div>
        </div>

        {/* Całkowita sprzedaż */}
        <div className="bg-appCard p-6 rounded-2xl border border-appBorder shadow-sm flex items-center gap-4 transition-colors duration-300">
          <div className="p-4 text-appPrimary">
            <TrendingUp size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-appMuted uppercase tracking-wider">Całkowita sprzedaż</p>
            <p className="text-2xl font-black text-appText">{totalSales.toLocaleString('pl-PL')} <span className="text-sm font-semibold text-appMuted">PLN</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Wykres kołowy */}
        <div className="bg-appCard p-6 rounded-2xl border border-appBorder shadow-sm flex flex-col transition-colors duration-300">
          <h3 className="text-sm font-bold text-appText uppercase tracking-wider mb-6">Podział wg statusu</h3>
          <div className="w-full h-75">
            <ResponsiveContainer minWidth="100%" aspect={2.10}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                  stroke="none"
                  isAnimationActive={false}
                />
                <RechartsTooltip 
                  formatter={(value) => [`${value} szt.`, 'Ilość']}
                  contentStyle={{ 
                    backgroundColor: 'var(--theme-card-elevated)', // Używamy lekko wyższej warstwy na tooltip
                    color: 'var(--theme-text)', 
                    borderColor: 'var(--theme-border-strong)', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                  }}
                  itemStyle={{ color: 'var(--theme-text)' }}
                />
                <Legend 
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ 
                    color: 'var(--theme-text)',
                    fontSize: '10px', 
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em',
                    paddingTop: '1rem'
                }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Wykres słupkowy */}
        <div className="bg-appCard p-6 rounded-2xl border border-appBorder shadow-sm flex flex-col transition-colors duration-300">
          <h3 className="text-sm font-bold text-appText uppercase tracking-wider mb-6">Sprzęt wg typu</h3>
          <div className="w-full h-75">
            <ResponsiveContainer width="100%" aspect={2.1}>
              <BarChart data={typeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--theme-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--theme-muted)', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--theme-muted)', fontSize: 12 }} />
                <RechartsTooltip 
                  cursor={{ fill: 'var(--theme-input-bg)' }}
                  formatter={(value) => [`${value} szt.`, 'Ilość']}
                  contentStyle={{ 
                    backgroundColor: 'var(--theme-card-elevated)',
                    color: 'var(--theme-text)', 
                    borderColor: 'var(--theme-border-strong)', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                  }}
                  itemStyle={{ color: 'var(--theme-text)' }}
                />
                <Bar dataKey="count" fill="var(--theme-chart-green)" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}