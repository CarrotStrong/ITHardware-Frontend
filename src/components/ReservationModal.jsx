import { useEffect } from 'react';
import { X } from 'lucide-react';
import FocusTrap from 'focus-trap-react';

export default function ReservationModal({ isOpen, onClose, onConfirm, itemName }) {
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onConfirm({ location: null });
  };

  return (
    <FocusTrap focusTrapOptions={{ allowOutsideClick: true }}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div className="bg-appModalBg p-6 rounded-xl shadow-2xl w-full max-w-md transform transition-all scale-100 relative">
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-appMuted hover:text-appText hover:bg-appInputBg rounded-lg transition-colors cursor-pointer active:scale-95"
          >
            <X size={20} />
          </button>

          <h3 className="text-xl font-bold mb-2 text-appText pr-8">Potwierdzenie rezerwacji</h3>
          
          <p className="text-appMuted mb-6 text-sm">
            Czy na pewno chcesz wysłać prośbę o rezerwację dla przedmiotu:<br/>
            <span className="font-semibold text-appText text-base mt-1 block">{itemName}</span>
          </p>
          
          <div className="flex justify-end gap-3">
            <button 
              onClick={onClose} 
              className="px-4 py-2 text-appMuted hover:bg-appInputBg rounded-lg transition-all cursor-pointer active:scale-95"
            >
              Anuluj
            </button>
            <button 
              onClick={handleSubmit} 
              className="bg-appPrimary hover:bg-appSecondary text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-all cursor-pointer active:scale-95"
            >
              Potwierdzam
            </button>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}