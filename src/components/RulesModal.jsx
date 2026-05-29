import { useEffect } from 'react';
import { X, BookMarked, ChevronRight } from 'lucide-react';
import { scrollLock } from '../hooks/scrollLock';
import FocusTrap from 'focus-trap-react';

export default function RulesModal({ isOpen, onClose }) {
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

  const rulesData = [
    {
      id: 'postanowienia-ogolne',
      title: '1. Postanowienia ogólne',
      content: 'RESERVER IT Hardware służy do wyprzedaży i utylizacji sprzętu poleasingowego i wycofanego z użytku w firmie. Sprzęt dostępny na wystawce jest używany, może posiadać ślady użytkowania, a jego stan techniczny jest opisany w szczegółach każdego przedmiotu. Kupujesz na własne ryzyko – sprzęt nie jest objęty standardową gwarancją.'
    },
    {
      id: 'zasady-rezerwacji',
      title: '2. Zasady rezerwacji sprzętu',
      content: 'Każdy pracownik może jednocześnie złożyć maksymalnie 3 prośby o rezerwację. Po zaakceptowaniu prośby przez administratora, rezerwacja jest ważna przez 3 dni robocze. W tym czasie należy podjąć decyzję odnośnie zakupu sprzętu. Po upływie tego czasu rezerwacja wygasa, a sprzęt wraca do ogólnodostępnej puli.'
    },
    {
      id: 'stan-baterii',
      title: '3. Stan baterii i zasilacze',
      content: 'Większość laptopów dostępnych na wystawce pochodzi z pracy biurowej, gdzie były stale podłączone do stacji dokujących. Z tego względu baterie mogą być w 100% wyeksploatowane lub nie trzymać napięcia. Zasilacze dorzucane są do sprzętu tylko wtedy, gdy zostały wyraźnie zaznaczone w opisie.'
    },
    {
      id: 'odbiory-i-platnosci',
      title: '4. Odbiory i płatności',
      content: 'Odbiór zarezerwowanego sprzętu odbywa się osobiście w dziale IT. Płatność realizowana jest zgodnie z wewnętrznymi procedurami księgowymi.'
    },
    {
      id: 'zwroty',
      title: '5. Zwroty i reklamacje',
      content: 'Z uwagi na charakter wystawki (sprzęt wyeksploatowany/poleasingowy sprzedawany "as is"), zwroty nie są przyjmowane, chyba że w ciągu 24 godzin od odbioru okaże się, że sprzęt posiada krytyczną wadę ukrytą (np. nie uruchamia się w ogóle), o której nie było mowy w opisie.'
    }
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

return (
    <FocusTrap focusTrapOptions={{ allowOutsideClick: true }}>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        
        <div 
          className="bg-appModalBg rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex justify-between items-center px-6 py-4 border-b border-appBorder bg-appModalBg z-10 shrink-0">
            <div className="flex items-center gap-3 text-appText">
              <div className="text-appPrimary rounded-lg">
                <BookMarked size={24} />
              </div>
              <h2 className="text-xl font-bold">Regulamin wystawki</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-appMuted hover:text-appText hover:bg-appInputBg rounded-xl transition-colors cursor-pointer active:scale-95"
            >
              <X size={24} />
            </button>
          </header>

          <div className="overflow-y-auto p-6 flex-1 scroll-smooth">
            
            <div className="bg-appInputBg border border-appBorder rounded-xl p-5 mb-8">
              <h3 className="text-xs font-bold text-appMuted uppercase tracking-widest mb-4">
                Spis treści
              </h3>
              <ul className="space-y-2">
                {rulesData.map((rule) => (
                  <li key={`toc-${rule.id}`}>
                    <button 
                      onClick={() => scrollToSection(rule.id)}
                      className="flex items-center gap-2 text-sm font-semibold text-appText/80 hover:text-appPrimary transition-colors text-left w-full group cursor-pointer"
                    >
                      <ChevronRight size={16} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-appPrimary" />
                      {rule.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              {rulesData.map((rule) => (
                <section key={rule.id} id={rule.id} className="scroll-mt-6">
                  <h3 className="text-lg font-bold text-appPrimary mb-3">
                    {rule.title}
                  </h3>
                  <p className="text-appText/90 leading-relaxed text-sm text-justify">
                    {rule.content}
                  </p>
                </section>
              ))}
            </div>

          </div>

          <footer className="px-6 py-4 border-t border-appBorder bg-appInputBg flex justify-end shrink-0">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 bg-appPrimary text-white font-bold text-sm rounded-xl hover:bg-appSecondary transition-all shadow-sm cursor-pointer active:scale-95"
            >
              Zrozumiałem, zamknij
            </button>
          </footer>
        </div>
      </div>
    </FocusTrap>
  );
}