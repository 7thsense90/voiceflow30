import React from 'react';
import { useApp } from '../context/AppContext';
import { SEOHead } from './SEOHead';
import { ArrowLeft, Home, BookOpen, HelpCircle } from 'lucide-react';

export const NotFoundView: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-50">
      <SEOHead
        title="Page Not Found (404) | Voice Flow 360"
        description="The requested page could not be located on Voice Flow 360. Browse our active brand research studies, product reviews, and consumer surveys."
        canonicalPath="/404"
      />
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-5 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 font-black text-2xl flex items-center justify-center mx-auto border border-purple-100">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            The page or study you requested could not be located. It may have moved or been archived.
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-2.5">
          <button
            onClick={() => setCurrentView('brand-case-studies')}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Browse Brand Studies</span>
          </button>
          <button
            onClick={() => setCurrentView('about-voiceflow')}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>About Voice Flow 360</span>
          </button>
          <button
            onClick={() => setCurrentView('faq')}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Frequently Asked Questions</span>
          </button>
        </div>
      </div>
    </div>
  );
};
