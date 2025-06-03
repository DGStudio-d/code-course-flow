
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/common/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Star, 
  PlayCircle, 
  FileText, 
  Award, 
  Calendar,
  Globe,
  CheckCircle
} from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Mock course data - in real app, this would come from API
  const course = {
    id: parseInt(id || '1'),
    title: 'English for Beginners',
    description: 'Master the fundamentals of English language with our comprehensive beginner course. Learn grammar, vocabulary, pronunciation, and conversation skills through interactive lessons and practical exercises.',
    instructor: {
      name: 'Sarah Johnson',
      bio: 'Certified ESL instructor with 10+ years of experience teaching English to international students.',
      image: '/placeholder.svg',
      rating: 4.9
    },
    level: 'Beginner',
    category: 'English',
    duration: '8 weeks',
    students: 324,
    rating: 4.8,
    reviews: 156,
    price: 299,
    originalPrice: 399,
    image: '/placeholder.svg',
    whatYouLearn: [
      'Basic English grammar and sentence structure',
      'Essential vocabulary for daily conversations',
      'Proper pronunciation and speaking skills',
      'Reading comprehension strategies',
      'Writing simple paragraphs and emails',
      'Listening skills and understanding native speakers'
    ],
    curriculum: [
      {
        week: 1,
        title: 'Introduction to English',
        lessons: ['Basic greetings', 'Alphabet and numbers', 'Simple introductions']
      },
      {
        week: 2,
        title: 'Grammar Fundamentals',
        lessons: ['Present tense', 'Articles (a, an, the)', 'Basic sentence structure']
      },
      {
        week: 3,
        title: 'Vocabulary Building',
        lessons: ['Common nouns', 'Action verbs', 'Adjectives and descriptions']
      },
      {
        week: 4,
        title: 'Daily Conversations',
        lessons: ['Shopping dialogues', 'Restaurant conversations', 'Asking for directions']
      }
    ],
    requirements: [
      'No prior English knowledge required',
      'Computer or mobile device for online lessons',
      'Willingness to practice speaking',
      'Basic understanding of your native language'
    ],
    features: [
      'Live interactive sessions',
      'Recorded lessons for review',
      'Personal feedback from instructor',
      'Course completion certificate',
      'Mobile app access',
      'Community forum access'
    ]
  };

  const handleEnroll = () => {
    setIsEnrolled(true);
    // In real app, this would handle payment and enrollment
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/courses')}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Header */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge className={getLevelColor(course.level)} variant="secondary">
                  {course.level}
                </Badge>
                <Badge variant="outline">{course.category}</Badge>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>
              
              <p className="text-lg text-gray-600 mb-6">
                {course.description}
              </p>

              {/* Course Stats */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{course.rating}</span>
                  <span>({course.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{course.students} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <span>English</span>
                </div>
              </div>
            </div>

            {/* Course Image */}
            <div className="aspect-video rounded-lg overflow-hidden">
              <img 
                src={course.image} 
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Course Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>What you'll learn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {course.whatYouLearn.map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="curriculum" className="space-y-4">
                {course.curriculum.map((week, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">Week {week.week}: {week.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {week.lessons.map((lesson, lessonIndex) => (
                          <div key={lessonIndex} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                            <PlayCircle className="h-4 w-4 text-blue-600" />
                            <span>{lesson}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="instructor">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <img 
                        src={course.instructor.image} 
                        alt={course.instructor.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{course.instructor.name}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{course.instructor.rating}</span>
                          <span className="text-gray-500">Instructor Rating</span>
                        </div>
                        <p className="text-gray-600">{course.instructor.bio}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <div className="text-center py-8 text-gray-500">
                  <p>Reviews section coming soon...</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-green-600">${course.price}</span>
                    <span className="text-lg text-gray-500 line-through">${course.originalPrice}</span>
                  </div>
                  <p className="text-sm text-gray-500">25% discount ends soon!</p>
                </div>

                {isEnrolled ? (
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="font-medium text-green-600 mb-4">You're enrolled!</p>
                    <Button className="w-full" onClick={() => navigate('/student-dashboard')}>
                      Go to Course
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button 
                      onClick={handleEnroll}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
                    >
                      Enroll Now
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      30-day money-back guarantee
                    </p>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t space-y-3">
                  <h4 className="font-medium">This course includes:</h4>
                  {course.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CourseDetail;
