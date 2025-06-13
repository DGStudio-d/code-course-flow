import Hero from "@/components/Hero";
import LanguageCard from "@/components/LanguageCard";
import TeacherCarousel from "@/components/TeacherCarousel";
import Header from "@/components/Header";
import Footer from "@/components/common/Footer";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useAppData } from "@/hooks/useAppData";
import type { RootState } from "@/config/store/store";
import { Language } from "@/types";

const Index = () => {
  const { t, i18n } = useTranslation();
  const { isLoading } = useAppData();
  const languages = useSelector((state: RootState) => state.appData.languages) as Language[];
  const isRTL = i18n.language === "ar";

  // Mock teachers data to prevent runtime error
  const mockTeachers = [
    {
      id: "1",
      name: "أحمد محمد علي",
      specialization: "معلم اللغة الإنجليزية",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      rating: 4.9,
      experience: 8,
      testimonial: "تعليم اللغة الإنجليزية بطرق تفاعلية ومبتكرة لضمان أفضل النتائج للطلاب"
    },
    {
      id: "2", 
      name: "فاطمة أحمد",
      specialization: "معلمة اللغة الفرنسية",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612c1c8?w=300&h=300&fit=crop&crop=face",
      rating: 4.8,
      experience: 6,
      testimonial: "أسعى لجعل تعلم الفرنسية تجربة ممتعة ومثمرة من خلال الأنشطة التفاعلية"
    },
    {
      id: "3",
      name: "محمد خالد",
      specialization: "معلم اللغة الألمانية", 
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      rating: 4.7,
      experience: 10,
      testimonial: "خبرة واسعة في تدريس الألمانية للمبتدئين والمتقدمين بأساليب حديثة"
    }
  ];

  const handleSelectLanguage = (languageId: string, difficulty: string) => {
    console.log(`Selected language ${languageId} with difficulty ${difficulty}`);
  };

  // Fallback languages if none loaded from store or API
  const fallbackLanguages = [
    { 
      id: '1', 
      code: 'en', 
      name: 'English', 
      nativeName: 'English',
      flag: '🇺🇸', 
      teachers: [],
      teacherCount: 15,
      studentCount: 120
    },
    { 
      id: '2', 
      code: 'ar', 
      name: 'العربية', 
      nativeName: 'Arabic',
      flag: '🇸🇦', 
      teachers: [],
      teacherCount: 12,
      studentCount: 85
    },
    { 
      id: '3', 
      code: 'fr', 
      name: 'Français', 
      nativeName: 'French',
      flag: '🇫🇷', 
      teachers: [],
      teacherCount: 10,
      studentCount: 95
    },
    { 
      id: '4', 
      code: 'es', 
      name: 'Español', 
      nativeName: 'Spanish',
      flag: '🇪🇸', 
      teachers: [],
      teacherCount: 8,
      studentCount: 70
    },
    { 
      id: '5', 
      code: 'de', 
      name: 'Deutsch', 
      nativeName: 'German',
      flag: '🇩🇪', 
      teachers: [],
      teacherCount: 6,
      studentCount: 45
    },
    { 
      id: '6', 
      code: 'it', 
      name: 'Italiano', 
      nativeName: 'Italian',
      flag: '🇮🇹', 
      teachers: [],
      teacherCount: 5,
      studentCount: 35
    }
  ];

  const displayLanguages = languages && languages.length > 0 ? languages : fallbackLanguages;

  return (
    <div className="min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      <Hero />
      
      {/* Languages Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 ${isRTL ? 'text-right' : 'text-left'} md:text-center`}>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("languages.title", "اكتشف اللغات المتاحة")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("languages.subtitle", "اختر اللغة التي تريد تعلمها مع أفضل المعلمين المتخصصين")}
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-lg text-gray-600">{t("admin.loading", "جاري التحميل...")}</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayLanguages.map((language) => (
                <LanguageCard 
                  key={language.id} 
                  language={language}
                  onSelectLanguage={handleSelectLanguage}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Teachers Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 ${isRTL ? 'text-right' : 'text-left'} md:text-center`}>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("teachers.title", "تعرف على أساتذتنا المتميزين")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("teachers.subtitle", "فريق من المعلمين المؤهلين والمتخصصين في تعليم اللغات بأحدث الطرق التفاعلية")}
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