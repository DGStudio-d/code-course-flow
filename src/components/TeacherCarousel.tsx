
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Star, Award } from 'lucide-react';
import { Teacher } from '@/types';

interface TeacherCarouselProps {
  teachers: Teacher[];
}

const TeacherCarousel = ({ teachers }: TeacherCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % teachers.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + teachers.length) % teachers.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  if (!teachers.length) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-primary-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            تعرف على أساتذتنا المتميزين
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            فريق من المعلمين المؤهلين والمتخصصين في تعليم اللغات بأحدث الطرق التفاعلية
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-3xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(${currentIndex * -100}%)` }}
            >
              {teachers.map((teacher, index) => (
                <div key={teacher.id} className="w-full flex-shrink-0">
                  <Card className="bg-green-gradient text-white border-0 shadow-2xl">
                    <CardContent className="p-8">
                      <div className="grid md:grid-cols-2 gap-8 items-center">
                        {/* Teacher Info */}
                        <div className="text-center md:text-right">
                          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm mb-6 mx-auto md:mx-0">
                            <img
                              src={teacher.avatar}
                              alt={teacher.name}
                              className="w-20 h-20 rounded-full object-cover border-4 border-white/30"
                            />
                          </div>
                          
                          <h3 className="text-2xl font-bold mb-2">{teacher.name}</h3>
                          <p className="text-green-100 mb-4 font-medium">{teacher.specialization}</p>
                          
                          <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
                            <div className="flex items-center gap-1">
                              <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                              <span className="font-bold">{teacher.rating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Award className="w-5 h-5" />
                              <span>{teacher.experience} سنوات خبرة</span>
                            </div>
                          </div>
                        </div>

                        {/* Testimonial */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                          <div className="text-6xl text-white/30 mb-4 font-serif">"</div>
                          <p className="text-lg leading-relaxed mb-4">
                            {teacher.testimonial}
                          </p>
                          <div className="text-right">
                            <div className="w-12 h-0.5 bg-white/50 mr-auto"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 -translate-y-1/2 -left-6 bg-white hover:bg-gray-50 border-green-200"
            onClick={prevSlide}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 -translate-y-1/2 -right-6 bg-white hover:bg-gray-50 border-green-200"
            onClick={nextSlide}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {teachers.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-primary-600 w-8' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeacherCarousel;
