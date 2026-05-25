"use client";

import { useEffect } from "react";

export default function GoogleTranslate({ enableAutoTranslation }: { enableAutoTranslation: boolean }) {
  useEffect(() => {
    if (enableAutoTranslation) {
      const scriptId = 'google-translate-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.type = 'text/javascript';
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.head.appendChild(script);

        // Define the global callback function
        (window as any).googleTranslateElementInit = () => {
          new (window as any).google.translate.TranslateElement(
            { 
              pageLanguage: 'en',
              includedLanguages: 'en,hi,bn,te,mr,ta,ur,gu,kn,ml,pa,or,as,mai,bho,sd,ne,ks,sa,doi,gom,brx,mni-Mtei,sat,lus', // Regional Indian languages
              layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false
            },
            'google_translate_element'
          );
        };
      }
    }
  }, [enableAutoTranslation]);

  return (
    enableAutoTranslation ? (
      <div id="google_translate_element" className="fixed bottom-24 right-6 z-50 overflow-hidden rounded-md shadow-lg"></div>
    ) : null
  );
}
