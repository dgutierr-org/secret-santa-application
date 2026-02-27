import React, { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage, type Language } from '../contexts/LanguageContext';

const languages = [
  { code: 'en' as Language, flag: '🇺🇸', name: 'English' },
  { code: 'es' as Language, flag: '🇪🇸', name: 'Español' },
  { code: 'fr' as Language, flag: '🇫🇷', name: 'Français' },
];

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageSelect = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative z-[999999]" ref={selectorRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition-colors"
        title="Select Language"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm">{currentLanguage.flag}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 overflow-hidden z-[999999]">
          <div className="flex">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`flex items-center justify-center px-3 py-2 text-lg hover:bg-white/20 transition-colors ${
                  language === lang.code ? 'bg-white/30' : ''
                }`}
                title={lang.name}
              >
                {lang.flag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
