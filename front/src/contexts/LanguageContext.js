import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from '../locales/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Recuperar idioma do localStorage ou usar en-US como padrão
    return localStorage.getItem('language') || 'en-US';
  });

  useEffect(() => {
    // Salvar idioma no localStorage quando mudar
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Retornar a chave se não encontrar a tradução
      }
    }
    
    return value || key;
  };

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage deve ser usado dentro de LanguageProvider');
  }
  return context;
};
