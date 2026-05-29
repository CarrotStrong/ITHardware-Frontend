import { useState, useRef, useEffect } from 'react';
import { Mail, X, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import FocusTrap from 'focus-trap-react';

export default function ContactWidget() {
  const demoUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = demoUser.email || 'Brak adresu e-mail';

  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLock = useRef(false);
  const trapContainerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsContactOpen(false);
      }
    };

    if (isContactOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isContactOpen]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (submitLock.current) return; 
    submitLock.current = true;
    setIsSubmitting(true);

    const toastId = toast.loading('Wysyłanie wiadomości...');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Wiadomość została wysłana!', { id: toastId });
      setIsContactOpen(false);
      setContactMessage('');
    } catch (err) {
      toast.error('Błąd połączenia z serwerem.', { id: toastId });
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 grid items-end justify-items-end pointer-events-none">
      
      <FocusTrap 
        active={isContactOpen} 
        containerElements={[trapContainerRef.current]}
        focusTrapOptions={{ 
          allowOutsideClick: true,
          fallbackFocus: () => trapContainerRef.current 
        }}
      >
        <div 
          ref={trapContainerRef}
          tabIndex={-1}
          className={`col-start-1 row-start-1 bg-appModalBg shadow-2xl rounded-2xl w-80 sm:w-96 overflow-hidden transition-all duration-300 origin-bottom-right outline-none ${
            isContactOpen ? 'scale-100 opacity-100 visible pointer-events-auto' : 'scale-0 opacity-0 invisible pointer-events-none'
          }`}
        >
          <div className="bg-navPrimary border-b border-appBorder p-4 flex justify-between items-center text-white">
            <h3 className="font-bold flex items-center gap-2">
              <Mail size={18} /> Napisz do nas
            </h3>
            <button 
              onClick={() => setIsContactOpen(false)}
              className="hover:bg-white/20 p-1 rounded-md transition-colors cursor-pointer active:scale-95"
            >
              <X size={18} />
            </button>
          </div>
          
          <form onSubmit={handleContactSubmit} className="p-5 flex flex-col gap-4 bg-appModalBg">
            <div>
              <label className="block text-xs font-bold text-appMuted mb-1 uppercase tracking-wide">
                Treść pytania
              </label>
              <textarea 
                required
                rows={6}
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="O co chcesz zapytać?"
                className="w-full px-3 py-2 bg-appInputBg text-appText border border-appBorder placeholder-appMuted rounded-lg focus:border-appPrimary focus:ring-1 focus:ring-appFocusRing outline-none text-sm resize-none transition-all"
              ></textarea>
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-appPrimary text-white font-bold py-2.5 rounded-lg hover:bg-appSecondary flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer active:scale-95 disabled:active:scale-100"
            >
              {isSubmitting ? (
                'Wysyłanie...' 
              ) : (
                <>Wyślij <Send size={16} /></>
              )}
            </button>
          </form>
        </div>
      </FocusTrap>

      <div 
        className={`col-start-1 row-start-1 relative group flex flex-col items-end transition-all duration-300 origin-center ${
          isContactOpen ? 'scale-50 opacity-0 pointer-events-none invisible' : 'scale-100 opacity-100 visible pointer-events-auto'
        }`}
      >
        <div className="absolute bottom-full mb-3 right-0 bg-appCard text-appText text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg border border-appBorder w-64 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none origin-bottom-right">
          Masz pytanie odnośnie sprzętu?<br></br> Kliknij, aby do nas napisać.
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-appCard border-b border-r border-appBorder transform rotate-45"></div>
        </div>

        <button
          onClick={() => setIsContactOpen(true)}
          className="bg-appPrimary text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:bg-appSecondary hover:-translate-y-1 transition-all flex items-center justify-center cursor-pointer active:scale-95"
        >
          <Mail size={24} />
        </button>
      </div>

    </div>
  );
}