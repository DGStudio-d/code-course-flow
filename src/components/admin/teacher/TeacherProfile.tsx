
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Save } from 'lucide-react';

export const TeacherProfile = () => {
  const [teacherProfile, setTeacherProfile] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    bio: '',
    qualifications: '',
    expertise: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      website: ''
    }
  });

  const handleSaveProfile = () => {
    console.log('Saving profile:', teacherProfile);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>الملف الشخصي للمعلم</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>صورة الملف الشخصي</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">انقر لرفع صورة أو اسحب الملف هنا</p>
            <p className="text-xs text-gray-400 mt-1">PNG، JPG بحد أقصى 2MB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name">الاسم الكامل</Label>
            <Input
              id="name"
              value={teacherProfile.name}
              onChange={(e) => setTeacherProfile({...teacherProfile, name: e.target.value})}
              placeholder="أدخل الاسم الكامل"
            />
          </div>

          <div>
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={teacherProfile.email}
              onChange={(e) => setTeacherProfile({...teacherProfile, email: e.target.value})}
              placeholder="example@domain.com"
            />
          </div>

          <div>
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              value={teacherProfile.phone}
              onChange={(e) => setTeacherProfile({...teacherProfile, phone: e.target.value})}
              placeholder="050-1234567"
            />
          </div>

          <div>
            <Label htmlFor="department">القسم</Label>
            <Select value={teacherProfile.department} onValueChange={(value) => setTeacherProfile({...teacherProfile, department: value})}>
              <SelectTrigger>
                <SelectValue placeholder="اختر القسم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">اللغة الإنجليزية</SelectItem>
                <SelectItem value="french">اللغة الفرنسية</SelectItem>
                <SelectItem value="german">اللغة الألمانية</SelectItem>
                <SelectItem value="spanish">اللغة الإسبانية</SelectItem>
                <SelectItem value="chinese">اللغة الصينية</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="bio">نبذة شخصية</Label>
          <Textarea
            id="bio"
            value={teacherProfile.bio}
            onChange={(e) => setTeacherProfile({...teacherProfile, bio: e.target.value})}
            placeholder="أدخل نبذة شخصية عن المعلم"
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="qualifications">المؤهلات والشهادات</Label>
          <Textarea
            id="qualifications"
            value={teacherProfile.qualifications}
            onChange={(e) => setTeacherProfile({...teacherProfile, qualifications: e.target.value})}
            placeholder="أدخل المؤهلات والشهادات"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="expertise">مجالات الخبرة</Label>
          <Textarea
            id="expertise"
            value={teacherProfile.expertise}
            onChange={(e) => setTeacherProfile({...teacherProfile, expertise: e.target.value})}
            placeholder="أدخل مجالات الخبرة"
            rows={3}
          />
        </div>

        <div>
          <Label>روابط وسائل التواصل الاجتماعي</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={teacherProfile.socialLinks.linkedin}
                onChange={(e) => setTeacherProfile({
                  ...teacherProfile,
                  socialLinks: {...teacherProfile.socialLinks, linkedin: e.target.value}
                })}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                value={teacherProfile.socialLinks.twitter}
                onChange={(e) => setTeacherProfile({
                  ...teacherProfile,
                  socialLinks: {...teacherProfile.socialLinks, twitter: e.target.value}
                })}
                placeholder="https://twitter.com/username"
              />
            </div>
            <div>
              <Label htmlFor="website">الموقع الشخصي</Label>
              <Input
                id="website"
                value={teacherProfile.socialLinks.website}
                onChange={(e) => setTeacherProfile({
                  ...teacherProfile,
                  socialLinks: {...teacherProfile.socialLinks, website: e.target.value}
                })}
                placeholder="https://website.com"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSaveProfile} className="flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>حفظ الملف الشخصي</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
