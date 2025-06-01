
import Hero from "@/components/Hero";
import LanguageCard from "@/components/LanguageCard";
import TeacherCarousel from "@/components/TeacherCarousel";
import Header from "@/components/Header";
import Footer from "@/components/common/Footer";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import type { RootState } from "@/config/store/store";

interface Language {
  id: string;
  code: string;
  name: string;
  flag: string;
  teachers: number;
}

const Index = () => {
  const { t } = useTranslation();
  const languages = useSelector((state: RootState) => state.appData.languages) as Language[];

  // Mock teachers data to prevent runtime error
  const mockTeachers = [
    {
      id: "1",
      name: "أحمد محمد علي",
      specialization: "معلم اللغة الإنجليزية",
      avatar: "/placeholder.svg",
      rating: 4.9,
      experience: 8,
      testimonial: "تعليم اللغة الإنجليزية بطرق تفاعلية ومبتكرة لضمان أفضل النتائج للطلاب"
    },
    {
      id: "2", 
      name: "فاطمة أحمد",
      specialization: "معلمة اللغة الفرنسية",
      avatar: "/placeholder.svg",
      rating: 4.8,
      experience: 6,
      testimonial: "أسعى لجعل تعلم الفرنسية تجربة ممتعة ومثمرة من خلال الأنشطة التفاعلية"
    },
    {
      id: "3",
      name: "محمد خالد",
      specialization: "معلم اللغة الألمانية", 
      avatar: "/placeholder.svg",
      rating: 4.7,
      experience: 10,
      testimonial: "خبرة واسعة في تدريس الألمانية للمبتدئين والمتقدمين بأساليب حديثة"
    }
  ];

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
                  language={{
                    id: language.id,
                    code: language.code,
                    name: language.name,
                    flag: language.flag,
                    teachers: []
                  }} 
                />
              ))
            ) : (
              // Fallback languages if none loaded from store
              [
                { id: '1', code: 'en', name: 'English', flag: '🇺🇸', teachers: [] },
                { id: '2', code: 'ar', name: 'العربية', flag: '🇸🇦', teachers: [] },
                { id: '3', code: 'fr', name: 'Français', flag: '🇫🇷', teachers: [] }
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
          <TeacherCarousel teachers={mockTeachers} />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
