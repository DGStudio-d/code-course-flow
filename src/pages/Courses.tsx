
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/common/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Clock, Users, Star, BookOpen, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Courses = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  // Mock courses data
  const courses = [
    {
      id: 1,
      title: 'English for Beginners',
      titleAr: 'الإنجليزية للمبتدئين',
      description: 'Learn English from scratch with interactive lessons',
      descriptionAr: 'تعلم الإنجليزية من الصفر مع دروس تفاعلية',
      instructor: 'Sarah Johnson',
      instructorAr: 'سارة جونسون',
      level: 'beginner',
      category: 'english',
      duration: '8 weeks',
      students: 324,
      rating: 4.8,
      price: 299,
      image: '/placeholder.svg',
      isPopular: true
    },
    {
      id: 2,
      title: 'Advanced Spanish Conversation',
      titleAr: 'محادثة إسبانية متقدمة',
      description: 'Master Spanish conversation skills with native speakers',
      descriptionAr: 'اتقن مهارات المحادثة الإسبانية مع متحدثين أصليين',
      instructor: 'Carlos Martinez',
      instructorAr: 'كارلوس مارتينيز',
      level: 'advanced',
      category: 'spanish',
      duration: '6 weeks',
      students: 156,
      rating: 4.9,
      price: 399,
      image: '/placeholder.svg'
    },
    {
      id: 3,
      title: 'French Grammar Intensive',
      titleAr: 'قواعد اللغة الفرنسية المكثفة',
      description: 'Complete French grammar course for all levels',
      descriptionAr: 'دورة قواعد اللغة الفرنسية الشاملة لجميع المستويات',
      instructor: 'Marie Dubois',
      instructorAr: 'ماري دوبوا',
      level: 'intermediate',
      category: 'french',
      duration: '10 weeks',
      students: 289,
      rating: 4.7,
      price: 349,
      image: '/placeholder.svg'
    },
    {
      id: 4,
      title: 'German Business Language',
      titleAr: 'لغة الأعمال الألمانية',
      description: 'Professional German for business environments',
      descriptionAr: 'الألمانية المهنية لبيئات الأعمال',
      instructor: 'Hans Mueller',
      instructorAr: 'هانس مولر',
      level: 'intermediate',
      category: 'german',
      duration: '12 weeks',
      students: 198,
      rating: 4.6,
      price: 449,
      image: '/placeholder.svg'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories', labelAr: 'جميع الفئات' },
    { value: 'english', label: 'English', labelAr: 'الإنجليزية' },
    { value: 'spanish', label: 'Spanish', labelAr: 'الإسبانية' },
    { value: 'french', label: 'French', labelAr: 'الفرنسية' },
    { value: 'german', label: 'German', labelAr: 'الألمانية' }
  ];

  const levels = [
    { value: 'all', label: 'All Levels', labelAr: 'جميع المستويات' },
    { value: 'beginner', label: 'Beginner', labelAr: 'مبتدئ' },
    { value: 'intermediate', label: 'Intermediate', labelAr: 'متوسط' },
    { value: 'advanced', label: 'Advanced', labelAr: 'متقدم' }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.titleAr.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const handleEnroll = (courseId: number) => {
    navigate(`/courses/${courseId}`);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('courses.hero.title', 'Discover Our Courses')}
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {t('courses.hero.subtitle', 'Learn languages with expert instructors and interactive lessons')}
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredCourses.length} Courses Available
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  {course.isPopular && (
                    <Badge className="absolute top-2 right-2 bg-orange-500">
                      Popular
                    </Badge>
                  )}
                </div>
                
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                    <Badge className={getLevelColor(course.level)} variant="secondary">
                      {course.level}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm">{course.description}</p>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.students} students
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 text-sm font-medium">{course.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">• {course.instructor}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="text-2xl font-bold text-green-600">
                        ${course.price}
                      </div>
                      <Button 
                        onClick={() => handleEnroll(course.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Enroll Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No courses found matching your criteria.</p>
              <p className="text-gray-400">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Courses;
