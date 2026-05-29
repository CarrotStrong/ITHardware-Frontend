import  { useEffect } from 'react';
import { X, StickyNote } from 'lucide-react';
import { scrollLock } from '../hooks/scrollLock';
import autorImg from '../assets/Autor.webp';
import FocusTrap from 'focus-trap-react';

export default function PatchNotesModal({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  scrollLock(isOpen);

  if (!isOpen) return null;

  const patchNotesData = [
    {
      version: "v1.1",
      date: "01.01.2026",
      changes: [
        "Added more bugs to fix later",
      ]
    },
    {
      version: "v1.0",
      date: "Official Release",
      changes: [
        "Implementacja kompleksowej architektury systemowej w oparciu o stos technologiczny PERN (PostgreSQL, Express, React, Node.js).",
        "Wdrożenie pełnego procesu biznesowego (End-to-End) dla obsługi sprzętu: od wstępnej rezerwacji po finalizację sprzedaży.",
        "Integracja serwera SMTP i implementacja zdarzeniowych powiadomień e-mail na kluczowych endpointach API.",
        "Opracowanie nowoczesnego, responsywnego interfejsu (UI) zoptymalizowanego pod kątem ergonomii i User Experience (UX).",
        "Integracja z systemem Keycloak oraz zastosowanie autoryzacji w modelu Seamless Sign-On."
      ]
    }
  ];

  return (
    <FocusTrap focusTrapOptions={{ allowOutsideClick: true }}>
      <div 
        className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div 
          className="bg-appModalBg rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex justify-between items-center px-6 py-4 border-b border-appBorder bg-appModalBg z-10 shrink-0">
            <div className="flex items-center gap-3 text-appText">
              <div className="text-appPrimary rounded-lg">
                <StickyNote size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Lista zmian</h2>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-appMuted hover:text-appText hover:bg-appInputBg rounded-xl transition-colors cursor-pointer active:scale-95"
            >
              <X size={24} />
            </button>
          </header>

          <div className="overflow-y-auto p-6 flex-1 space-y-8 scroll-smooth">
            {patchNotesData.map((note) => (
              <section key={note.version} className="relative pl-6 border-l-2 border-appBorder">
                
                <div className="flex items-baseline gap-3 mb-3">
                  <h3 className="text-lg font-bold text-appPrimary">{note.version}</h3>
                  <span className="text-xs text-appMuted font-medium">{note.date}</span>
                </div>

                <ul className="space-y-3">
                  {note.changes.map((change, index) => (
                    <li key={index} className="flex gap-3 text-sm text-appText/90 leading-relaxed">
                      <span className="text-appPrimary mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-appPrimary" />
                      <span>
                        {change}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <footer className="px-6 py-4 border-t border-appBorder bg-appInputBg flex justify-end shrink-0">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 bg-appPrimary text-white font-bold text-sm rounded-xl hover:bg-appSecondary transition-all shadow-sm cursor-pointer active:scale-95"
            >
              Rozumiem
            </button>
          </footer>
        </div>
      </div>
    </FocusTrap>
  );
}