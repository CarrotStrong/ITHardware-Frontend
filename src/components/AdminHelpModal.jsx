import { useEffect } from 'react';
import { X, CircleHelp, ChevronRight } from 'lucide-react';
import { scrollLock } from '../hooks/scrollLock';
import FocusTrap from 'focus-trap-react';

export default function AdminHelpModal({ isOpen, onClose }) {
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
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  scrollLock(isOpen);

  if (!isOpen) return null;

  const helpData = [
    {
      id: 'statystyki',
      title: '1. Statystyki (Dashboard)',
      content: 'Główny pulpit administratora, który agreguje najważniejsze dane. Znajdziesz tu podsumowanie ilości sprzętu w poszczególnych statusach, szybki rzut oka na najnowsze rezerwacje oraz informacje o wydajności całego procesu.'
    },
    {
      id: 'zasoby',
      title: '2. Zarządzanie zasobami',
      content: 'W zakładce "Zasoby" znajduje się pełna lista sprzętu wprowadzona do bazy. Po kliknięciu w ikonę ołówka (edycji), otworzy się modal, który pozwala zmieniać statusy urządzeń, przeglądać ich historię operacji, decydować o ich złomowaniu lub edytować ich parametry techniczne. Używaj filtrów na górze ekranu, aby szybko znaleźć interesujące Cię urządzenia.'
    },
    {
      id: 'rezerwacje',
      title: '3. Obsługa rezerwacji',
      content: 'Tutaj spływają wszystkie prośby od użytkowników z Publicznej strony. Jeśli na ikonie zegara świeci się pomarańczowa kropka, oznacza to nowe, oczekujące rezerwacje. Możesz je akceptować (rezerwacja na 3 dni - cron automatycznie przywraca sprzęt do puli dostępnych) lub odrzucać. Gdy użytkownik fizycznie odbierze sprzęt, zmieniasz tu status na "Wydane". Jeśli zdecyduje się na zakup, klikasz "Sprzedaj".'
    },
    {
      id: 'dodawanie',
      title: '4. Dodawanie nowego sprzętu',
      content: 'Zakładka służąca do ręcznego wprowadzania nowego sprzętu na sprzedaż. Koniecznie upewnij się, że wpisujesz poprawny numer inwentarzowy (NRI). Uzupełniając formularz, system automatycznie ujednolici wpisane dane w kluczowych miejscach (np. i5 8400 => i5-8400 (dodany dywiz). Jeśli w systemie znajduje się ten sam model sprzętu od danego producenta, system wyświetli podpowiedź z ceną tamtego sprzętu, co pomoże uniknąć rozbieżności cenowych tych samych zasobów.'
    },
    {
        id: 'funkcje',
        title: '5. Funkcje wyłączone na potrzeby Live Demo',
        content: 'Brak autoryzacji (Keycloak, Seamless Sign-On, Konta domenowe, Role Based Access). Brak wysyłki maili (zautomatyzowany proces, serwer SMTP, szablony mailowe).'
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        
        <div 
          className="bg-appModalBg rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex justify-between items-center px-6 py-4 border-b border-appBorder bg-appModalBg z-10 shrink-0">
            <div className="flex items-center gap-3 text-appText">
              <div className="text-appPrimary rounded-lg">
                <CircleHelp size={24} />
              </div>
              <h2 className="text-xl font-bold">Instrukcja panelu administratora</h2>
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
                {helpData.map((section) => (
                  <li key={`toc-${section.id}`}>
                    <button 
                      onClick={() => scrollToSection(section.id)}
                      className="flex items-center gap-2 text-sm font-semibold text-appText/80 hover:text-appPrimary transition-colors text-left w-full group cursor-pointer"
                    >
                      <ChevronRight size={16} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-appPrimary" />
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              {helpData.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-6">
                  <h3 className="text-lg font-bold text-appPrimary mb-3">
                    {section.title}
                  </h3>
                  <p className="text-appText/90 leading-relaxed text-sm text-justify">
                    {section.content}
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
              Zamknij pomoc
            </button>
          </footer>
        </div>
      </div>
    </FocusTrap>
  );
}