
import { useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MessageCircle, Calendar, Search, Filter, Award, Clock } from 'lucide-react';
import { Teacher } from '@/types';

// Extended teachers data
const teachers: Teacher[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612c1c8?w=300&h=300&fit=crop&crop=face',
    language: 'الإنجليزية',
    specialization: 'محادثة وقواعد',
    rating: 4.9,
    testimonial: 'معلمة متميزة في تعليم اللغة الإنجليزية مع خبرة واسعة',
    experience: 8
  },
  {
    id: '2',
    name: 'Pierre Dubois',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
    language: 'الفرنسية',
    specialization: 'أدب وثقافة',
    rating: 4.8,
    testimonial: 'خبير في تعليم الفرنسية والثقافة الفرنسية',
    experience: 12
  },
  {
    id: '3',
    name: 'Hans Mueller',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    language: 'الألمانية',
    specialization: 'أعمال ومهني',
    rating: 4.7,
    testimonial: 'متخصص في تعليم الألمانية للأعمال',
    experience: 10
  },
  {
    id: '4',
    name: 'Maria Garcia',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
    language: 'الإسبانية',
    specialization: 'محادثة يومية',
    rating: 4.9,
    testimonial: 'معلمة إسبانية أصلية متحمسة لتعليم اللغة',
    experience: 7
  },
  {
    id: '5',
    name: 'Marco Rossi',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face',
    language: 'الإيطالية',
    specialization: 'فنون وثقافة',
    rating: 4.6,
    testimonial: 'شغوف بتعليم الإيطالية والفن الإيطالي',
    experience: 9
  },
  {
    id: '6',
    name: 'Emily Chen',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop&crop=face',
    language: 'الإنجليزية',
    specialization: 'IELTS و TOEFL',
    rating: 4.8,
    testimonial: 'خبيرة في تحضير امتحانات اللغة الإنجليزية',
    experience: 6
  }
];

const Teachers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.language.includes(searchTerm) ||
                         teacher.specialization.includes(searchTerm);
    const matchesLanguage = selectedLanguage === 'all' || teacher.language === selectedLanguage;
    const matchesSpecialization = selectedSpecialization === 'all' || 
                                 teacher.specialization.includes(selectedSpecialization);
    
    return matchesSearch && matchesLanguage && matchesSpecialization;
  });

  const handleBookSession = (teacherId: string) => {
    console.log(`Booking session with teacher: ${teacherId}`);
    // This would typically open a booking modal or navigate to booking page
  };

  const handleSendMessage = (teacherId: string) => {
    console.log(`Sending message to teacher: ${teacherId}`);
    // This would typically open a chat or message modal
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-green-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            معلمونا المتميزون
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            تعرف على فريق المعلمين المؤهلين والمتخصصين في تعليم اللغات من جميع أنحاء العالم
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="ابحث عن المعلمين..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-4">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 ml-2" />
                  <SelectValue placeholder="اللغة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل اللغات</SelectItem>
                  <SelectItem value="الإنجليزية">الإنجليزية</SelectItem>
                  <SelectItem value="الفرنسية">الفرنسية</SelectItem>
                  <SelectItem value="الألمانية">الألمانية</SelectItem>
                  <SelectItem value="الإسبانية">الإسبانية</SelectItem>
                  <SelectItem value="الإيطالية">الإيطالية</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="التخصص" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل التخصصات</SelectItem>
                  <SelectItem value="محادثة">محادثة</SelectItem>
                  <SelectItem value="قواعد">قواعد</SelectItem>
                  <SelectItem value="أعمال">أعمال</SelectItem>
                  <SelectItem value="ثقافة">ثقافة</SelectItem>
                  <SelectItem value="امتحانات">امتحانات</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Teachers Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTeachers.map((teacher) => (
              <Card key={teacher.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardHeader className="text-center">
                  <div className="relative mx-auto mb-4">
                    <img 
                      src={teacher.avatar} 
                      alt={teacher.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 rounded-full">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {teacher.name}
                  </h3>
                  
                  <div className="flex justify-center gap-2 flex-wrap mt-2">
                    <Badge variant="secondary" className="text-sm">
                      {teacher.language}
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      {teacher.specialization}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex justify-center items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="font-semibold">{teacher.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{teacher.experience} سنوات خبرة</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-center text-sm">
                    {teacher.testimonial}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleBookSession(teacher.id)}
                      className="flex-1 bg-green-gradient hover:opacity-90"
                      size="sm"
                    >
                      <Calendar className="w-4 h-4 ml-2" />
                      حجز جلسة
                    </Button>
                    <Button 
                      onClick={() => handleSendMessage(teacher.id)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <MessageCircle className="w-4 h-4 ml-2" />
                      رسالة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredTeachers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👨‍🏫</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                لا يوجد معلمون متاحون
              </h3>
              <p className="text-gray-600">
                جرب تغيير معايير البحث أو الفلاتر
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              إحصائياتنا المتميزة
            </h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: '50+', label: 'معلم متخصص', icon: '👨‍🏫' },
              { number: '95%', label: 'معدل الرضا', icon: '⭐' },
              { number: '1000+', label: 'طالب نشط', icon: '🎓' },
              { number: '24/7', label: 'دعم مستمر', icon: '🕒' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{stat.icon}</div>
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Teachers;
