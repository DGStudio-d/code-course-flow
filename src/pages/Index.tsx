
import Hero from "@/components/Hero";
import LanguageCard from "@/components/LanguageCard";
import TeacherCarousel from "@/components/TeacherCarousel";
import Header from "@/components/Header";
import Footer from "@/components/common/Footer";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import type { RootState } from "@/config/store/store";

interface Language {
  id: number;
  code: string;
  name: string;
  flag: string;
  teachers: number;
}

const Index = () => {
  const { t } = useTranslation();
  const languages = useSelector((state: RootState) => state.appData.languages) as Language[];

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      
      {/* Languages Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("languages.title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("languages.subtitle")}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {languages && languages.length > 0 ? (
              languages.map((language) => (
                <LanguageCard 
                  key={language.id} 
                  language={language} 
                />
              ))
            ) : (
              // Fallback languages if none loaded from store
              [
                { id: 1, code: 'en', name: 'English', flag: '🇺🇸', teachers: 15 },
                { id: 2, code: 'ar', name: 'العربية', flag: '🇸🇦', teachers: 12 },
                { id: 3, code: 'fr', name: 'Français', flag: '🇫🇷', teachers: 8 }
              ].map((language) => (
                <LanguageCard 
                  key={language.id} 
                  language={language} 
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Teachers Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("teachers.title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("teachers.subtitle")}
            </p>
          </div>
          <TeacherCarousel />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
