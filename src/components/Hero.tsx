
import { Button } from '@/components/ui/button';
import { Play, Star, Users, BookOpen } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-[80vh] bg-gradient-to-br from-primary-50 via-white to-primary-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-right animate-fade-in">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              دورات لغوية عالية الجودة
              <span className="block bg-green-gradient bg-clip-text text-transparent mt-2">
                بأسعار معقولة
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
              نعتقد أن اختيار الدورة المناسبة لا يجب أن يكون أمراً معقداً. إذا لم تكن راضياً عن الدورة التي اخترتها، نقدم لك ضماناً كاملاً لاسترداد الأموال لمدة 60 يوماً.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Button size="lg" className="bg-green-gradient hover:opacity-90 text-lg px-8 py-6">
                ابدأ رحلتك التعليمية
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 group">
                <Play className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                شاهد كيف نعمل
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-green-100">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">5000+</div>
                <div className="text-sm text-gray-600">طالب نشط</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-green-100">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="w-6 h-6 text-primary-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">50+</div>
                <div className="text-sm text-gray-600">دورة متاحة</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-green-100">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-6 h-6 text-primary-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">4.9</div>
                <div className="text-sm text-gray-600">تقييم المستخدمين</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative animate-slide-in-right">
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-green-100">
              <img
                src="/lovable-uploads/cec2c3f2-aa59-4991-911a-debb45524167.png"
                alt="Language Learning Environment"
                className="w-full h-80 object-cover rounded-2xl"
              />
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-green-gradient text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                ابدأ الآن
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-medium shadow-lg border border-green-100">
                60 يوم ضمان
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
