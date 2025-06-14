import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface LanguageCardProps {
  country: string;
  arabicName: string;
  englishName: string;
  illustration: string;
  gradient: string;
  onClick: () => void;
}

const LanguageCard: React.FC<LanguageCardProps> = ({
  country,
  arabicName,
  englishName,
  illustration,
  gradient,
  onClick
}) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <Card 
      className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border-0"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* 3D Illustration Container */}
        <div className="relative h-48 overflow-hidden rounded-t-2xl">
          <div 
            className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-6xl transform group-hover:scale-110 transition-transform duration-500"
            style={{ background: `linear-gradient(135deg, ${gradient})` }}
          >
            {illustration}
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-4 left-4 w-3 h-3 bg-white/30 rounded-full animate-pulse"></div>
          <div className="absolute top-8 right-6 w-2 h-2 bg-white/40 rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-6 left-6 w-4 h-4 bg-white/20 rounded-full animate-pulse delay-700"></div>
        </div>

        {/* Text Overlay with Gradient */}
        <div className="relative">
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
            style={{ 
              background: `linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)`
            }}
          ></div>
          
          <div className={`relative p-6 text-center ${isRTL ? 'text-right' : 'text-left'}`}>
            <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-green-600 transition-colors">
              {arabicName}
            </h3>
            <p className="text-sm text-gray-600 font-medium">
              {englishName}
            </p>
            
            {/* Hover Arrow */}
            <div className={`mt-4 flex ${isRTL ? 'justify-start' : 'justify-end'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AvailableLanguagesSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const languages = [
    {
      country: 'germany',
      arabicName: 'الألمانية',
      englishName: 'German',
      illustration: '🏰',
      gradient: '#FF6B6B, #4ECDC4, #45B7D1'
    },
    {
      country: 'france',
      arabicName: 'الفرنسية',
      englishName: 'French',
      illustration: '🗼',
      gradient: '#667eea, #764ba2, #f093fb'
    },
    {
      country: 'italy',
      arabicName: 'الإيطالية',
      englishName: 'Italian',
      illustration: '🏛️',
      gradient: '#ffecd2, #fcb69f, #ff9a9e'
    },
    {
      country: 'spain',
      arabicName: 'الإسبانية',
      englishName: 'Spanish',
      illustration: '🏛️',
      gradient: '#a8edea, #fed6e3, #ffd89b'
    }
  ];

  const handleLanguageClick = (country: string) => {
    console.log(`Selected language: ${country}`);
    // Add navigation logic here
  };

  return (
    <section 
      className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-purple-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-16 ${isRTL ? 'text-right' : 'text-left'} md:text-center`}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-6">
            <span className="text-2xl">🌍</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {t('languages.available.title', 'اللغات المتوفرة')}
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('languages.available.subtitle', 'اختر اللغة التي تريد تعلمها واستكشف ثقافات جديدة مع أفضل المعلمين المتخصصين')}
          </p>
          
          {/* Decorative Line */}
          <div className="flex items-center justify-center mt-8">
            <div className="w-20 h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full mx-4"></div>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          </div>
        </div>

        {/* Language Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {languages.map((language, index) => (
            <div
              key={language.country}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <LanguageCard
                {...language}
                onClick={() => handleLanguageClick(language.country)}
              />
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <span className="text-lg font-medium">
              {t('languages.available.viewAll', 'عرض جميع اللغات')}
            </span>
            {isRTL ? (
              <ArrowLeft className="w-5 h-5 mr-2" />
            ) : (
              <ArrowRight className="w-5 h-5 ml-2" />
            )}
          </Button>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
};

export default AvailableLanguagesSection;