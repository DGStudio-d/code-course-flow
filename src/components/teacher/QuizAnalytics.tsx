
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, TrendingUp, Users, Target, Award } from 'lucide-react';

const QuizAnalytics = () => {
  // Sample analytics data
  const performanceData = [
    { difficulty: 'مبتدئ', passRate: 85, students: 120 },
    { difficulty: 'متوسط', passRate: 72, students: 95 },
    { difficulty: 'متقدم', passRate: 68, students: 45 }
  ];

  const monthlyData = [
    { month: 'يناير', completed: 145, average: 76 },
    { month: 'فبراير', completed: 167, average: 78 },
    { month: 'مارس', completed: 189, average: 82 },
    { month: 'أبريل', completed: 156, average: 79 },
    { month: 'مايو', completed: 198, average: 84 }
  ];

  const difficultyDistribution = [
    { name: 'مبتدئ', value: 45, color: '#10B981' },
    { name: 'متوسط', value: 35, color: '#F59E0B' },
    { name: 'متقدم', value: 20, color: '#EF4444' }
  ];

  const topQuizzes = [
    { title: 'اختبار القواعد الأساسية', attempts: 89, avgScore: 82 },
    { title: 'اختبار المفردات اليومية', attempts: 76, avgScore: 78 },
    { title: 'اختبار المحادثة', attempts: 65, avgScore: 85 },
    { title: 'اختبار الاستماع', attempts: 54, avgScore: 73 }
  ];

  const chartConfig = {
    passRate: {
      label: "معدل النجاح",
      color: "#10B981",
    },
    students: {
      label: "عدد الطلاب",
      color: "#3B82F6",
    },
    completed: {
      label: "الاختبارات المكتملة",
      color: "#8B5CF6",
    },
    average: {
      label: "المتوسط",
      color: "#F59E0B",
    }
  };

  const exportResults = (format: 'csv' | 'pdf') => {
    console.log(`Exporting results as ${format}`);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'إجمالي المحاولات', value: '1,247', icon: Target, change: '+12%' },
          { title: 'متوسط النتائج', value: '76%', icon: Award, change: '+5%' },
          { title: 'معدل الإكمال', value: '89%', icon: TrendingUp, change: '+8%' },
          { title: 'الطلاب النشطون', value: '234', icon: Users, change: '+15%' }
        ].map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-green-600">{stat.change} من الشهر الماضي</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Export */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="الفترة الزمنية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الفترات</SelectItem>
              <SelectItem value="week">الأسبوع الماضي</SelectItem>
              <SelectItem value="month">الشهر الماضي</SelectItem>
              <SelectItem value="quarter">الربع الماضي</SelectItem>
            </SelectContent>
          </Select>
          
          <Select defaultValue="all">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="المستوى" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل المستويات</SelectItem>
              <SelectItem value="beginner">مبتدئ</SelectItem>
              <SelectItem value="intermediate">متوسط</SelectItem>
              <SelectItem value="advanced">متقدم</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportResults('csv')}>
            <Download className="w-4 h-4 ml-2" />
            تصدير CSV
          </Button>
          <Button variant="outline" onClick={() => exportResults('pdf')}>
            <Download className="w-4 h-4 ml-2" />
            تصدير PDF
          </Button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance by Difficulty */}
        <Card>
          <CardHeader>
            <CardTitle>الأداء حسب مستوى الصعوبة</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <XAxis dataKey="difficulty" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="passRate" fill="var(--color-passRate)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>الاتجاهات الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="completed" stroke="var(--color-completed)" strokeWidth={2} />
                  <Line type="monotone" dataKey="average" stroke="var(--color-average)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Difficulty Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع مستويات الصعوبة</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {difficultyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Performing Quizzes */}
        <Card>
          <CardHeader>
            <CardTitle>الاختبارات الأكثر أداءً</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topQuizzes.map((quiz, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{quiz.title}</p>
                    <p className="text-sm text-gray-600">{quiz.attempts} محاولة</p>
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold text-green-600">{quiz.avgScore}%</div>
                    <div className="text-xs text-gray-500">متوسط النتيجة</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizAnalytics;
