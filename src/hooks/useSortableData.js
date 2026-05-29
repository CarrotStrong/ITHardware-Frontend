import { useState, useMemo } from 'react';

export default function useSortableData(items, config = null) {
  const [sortConfig, setSortConfig] = useState(config || { key: null, direction: 'asc' });

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = '', bValue = '';

        if (sortConfig.key === 'equipment') {
          aValue = `${a.manufacturer} ${a.model}`.toLowerCase();
          bValue = `${b.manufacturer} ${b.model}`.toLowerCase();
        } else if (sortConfig.key === 'status') {
          aValue = (a.status || '').toLowerCase();
          bValue = (b.status || '').toLowerCase();
        } else if (sortConfig.key === 'added_by') {
          aValue = (a.added_by || '').toLowerCase();
          bValue = (b.added_by || '').toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const clearSort = () => setSortConfig({ key: null, direction: 'asc' });

  return { sortedItems, sortConfig, requestSort, clearSort };
}