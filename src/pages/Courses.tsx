
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Users, Star, Search, Filter } from 'lucide-react';
import { Course } from '@/types';

// Sample courses data
const courses: Course[] = [
  {
    id: '1',
    title: 'English for Beginners',
    description: 'Learn the basics of English language with interactive lessons and exercises.',
    languageId: 'en',
    difficulty: 'beginner',
    duration: '4 weeks',
    lessonsCount: 20,
    price: 299,
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&h=300&fit=crop'
  },
  {
    id: '2',
    title: 'French Conversation',
    description: 'Improve your French speaking skills through practical conversation exercises.',
    languageId: 'fr',
    difficulty: 'intermediate',
    duration: '6 weeks',
    lessonsCount: 30,
    price: 399,
    thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=300&fit=crop'
  },
  {
    id: '3',
    title: 'Advanced German Grammar',
    description: 'Master complex German grammar rules and advanced language structures.',
    languageId: 'de',
    difficulty: 'advanced',
    duration: '8 weeks',
    lessonsCount: 40,
    price: 499,
    thumbnail: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&h=300&fit=crop'
  },
  {
    id: '4',
    title: 'Spanish Culture & Language',
    description: 'Explore Spanish culture while learning the language through immersive content.',
    languageId: 'es',
    difficulty: 'intermediate',
    duration: '5 weeks',
    lessonsCount: 25,
    price: 349,
    thumbnail: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=500&h=300&fit=crop'
  },
  {
    id: '5',
    title: 'Italian Basics',
    description: 'Start your Italian journey with fundamental vocabulary and phrases.',
    languageId: 'it',
    difficulty: 'beginner',
    duration: '3 weeks',
    lessonsCount: 15,
    price: 249,
    thumbnail: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=500&h=300&fit=crop'
  },
  {
    id: '6',
    title: 'Business English',
    description: 'Professional English skills for workplace communication and presentations.',
    languageId: 'en',
    difficulty: 'advanced',
    duration: '10 weeks',
    lessonsCount: 50,
    price: 599,
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=300&fit=crop'
  }
];

const Courses = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || course.difficulty === selectedDifficulty;
    const matchesLanguage = selectedLanguage === 'all' || course.languageId === selectedLanguage;
    
    return matchesSearch && matchesDifficulty && matchesLanguage;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'مبتدئ';
      case 'intermediate': return 'متوسط';
      case 'advanced': return 'متقدم';
      default: return difficulty;
    }
  };

  const handleEnrollCourse = (courseId: string) => {
    console.log(`Enrolling in course: ${courseId}`);
    navigate('/quiz');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-green-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            دوراتنا التعليمية
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            اكتشف مجموعة واسعة من الدورات المصممة خصيصاً لتعلم اللغات بطريقة تفاعلية وممتعة
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
                placeholder="ابحث عن الدورات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-4">
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 ml-2" />
                  <SelectValue placeholder="المستوى" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل المستويات</SelectItem>
                  <SelectItem value="beginner">مبتدئ</SelectItem>
                  <SelectItem value="intermediate">متوسط</SelectItem>
                  <SelectItem value="advanced">متقدم</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="اللغة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل اللغات</SelectItem>
                  <SelectItem value="en">الإنجليزية</SelectItem>
                  <SelectItem value="fr">الفرنسية</SelectItem>
                  <SelectItem value="de">الألمانية</SelectItem>
                  <SelectItem value="es">الإسبانية</SelectItem>
                  <SelectItem value="it">الإيطالية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge 
                    className={`absolute top-4 right-4 ${getDifficultyColor(course.difficulty)}`}
                  >
                    {getDifficultyLabel(course.difficulty)}
                  </Badge>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 group-hover:text-primary-600 transition-colors">
                    {course.title}
                  </CardTitle>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {course.description}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.lessonsCount} درس</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>4.8</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {course.price} ر.س
                    </div>
                    <Button 
                      onClick={() => handleEnrollCourse(course.id)}
                      className="bg-green-gradient hover:opacity-90"
                    >
                      التسجيل الآن
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                لا توجد دورات متاحة
              </h3>
              <p className="text-gray-600">
                جرب تغيير معايير البحث أو الفلاتر
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Courses;
