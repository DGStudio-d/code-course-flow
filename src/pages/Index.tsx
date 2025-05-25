
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import LanguageCard from '@/components/LanguageCard';
import TeacherCarousel from '@/components/TeacherCarousel';
import ContactForm from '@/components/ContactForm';
import { languages, teachers } from '@/lib/data';
import { Globe, Award, Users, Star } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const handleSelectLanguage = (languageId: string, difficulty: string) => {
    console.log(`Selected language: ${languageId}, difficulty: ${difficulty}`);
    navigate('/quiz');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      
      {/* Languages Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              اللغات المتوفرة
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              اختر اللغة التي تريد تعلمها من مجموعة واسعة من اللغات العالمية
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {languages.map((language) => (
              <LanguageCard
                key={language.id}
                language={language}
                onSelectLanguage={handleSelectLanguage}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-primary-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              لماذا نحن الخيار الأفضل؟
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              نقدم تجربة تعليمية فريدة ومتطورة تضمن لك أفضل النتائج
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Globe,
                title: 'معلمون مؤهلون',
                description: 'فريق من أفضل المعلمين المتخصصين'
              },
              {
                icon: Award,
                title: 'شهادات معتمدة',
                description: 'احصل على شهادات معترف بها دولياً'
              },
              {
                icon: Users,
                title: 'مجتمع نشط',
                description: 'انضم لمجتمع من الطلاب المتحمسين'
              },
              {
                icon: Star,
                title: 'جودة عالية',
                description: 'محتوى تعليمي عالي الجودة ومحدث'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-green-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TeacherCarousel teachers={teachers} />
      <ContactForm />
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                <div className="w-8 h-8 bg-green-gradient rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold">عندنا</span>
              </div>
              <p className="text-gray-400">
                منصة تعليم اللغات الرائدة في المنطقة
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">روابط سريعة</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/" className="hover:text-white transition-colors">الرئيسية</a></li>
                <li><a href="/courses" className="hover:text-white transition-colors">الدورات</a></li>
                <li><a href="/teachers" className="hover:text-white transition-colors">المعلمون</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">تواصل معنا</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">اللغات</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">الإنجليزية</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الفرنسية</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الألمانية</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الإسبانية</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">تواصل معنا</h3>
              <div className="space-y-2 text-gray-400">
                <p>info@learnacademy.com</p>
                <p>+966 50 123 4567</p>
                <p>الرياض، المملكة العربية السعودية</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 عندنا. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
