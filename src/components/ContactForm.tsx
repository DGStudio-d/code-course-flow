
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    level: '',
    language: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    
    toast({
      title: "تم إرسال الرسالة بنجاح",
      description: "سنتواصل معك قريباً",
    });

    setFormData({
      name: '',
      email: '',
      phone: '',
      level: '',
      language: '',
      message: ''
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-primary-50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              تواصل معنا
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              ابدأ الآن تعلم لغتك المفضلة في بيئة تعليمية مريحة وبأسعار مناسبة!
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-gradient rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">الهاتف</h3>
                  <p className="text-gray-600">+966 50 123 4567</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-gradient rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">البريد الإلكتروني</h3>
                  <p className="text-gray-600">info@learnacademy.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-gradient rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">العنوان</h3>
                  <p className="text-gray-600">الرياض، المملكة العربية السعودية</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="border-green-100 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">شنو خنسنا!</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">الإسم الكامل *</Label>
                    <Input
                      id="name"
                      placeholder="الإسم والنسب"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">العمر *</Label>
                    <Input
                      id="email"
                      placeholder="العمر"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">البريد الإلكتروني *</Label>
                    <Input
                      id="phone"
                      placeholder="البريد الإلكتروني"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="level">الهاتف *</Label>
                    <Input
                      id="level"
                      placeholder="الهاتف"
                      value={formData.level}
                      onChange={(e) => handleChange('level', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>حدد المستوى *</Label>
                    <Select onValueChange={(value) => handleChange('level', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="إبتدائي" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">إبتدائي</SelectItem>
                        <SelectItem value="intermediate">متوسط</SelectItem>
                        <SelectItem value="advanced">متقدم</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>حدد اللغة *</Label>
                    <Select onValueChange={(value) => handleChange('language', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="الإنجليزية" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">الإنجليزية</SelectItem>
                        <SelectItem value="french">الفرنسية</SelectItem>
                        <SelectItem value="german">الألمانية</SelectItem>
                        <SelectItem value="spanish">الإسبانية</SelectItem>
                        <SelectItem value="italian">الإيطالية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>حدد الاختيار *</Label>
                  <Select onValueChange={(value) => handleChange('preference', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="فردي" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">فردي</SelectItem>
                      <SelectItem value="group">جماعي</SelectItem>
                      <SelectItem value="online">أونلاين</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full bg-green-gradient hover:opacity-90 text-lg py-6">
                  Send
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
