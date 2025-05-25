
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Shield, Bell } from "lucide-react";

const siteSettingsFormSchema = z.object({
  siteName: z.string().min(2, {
    message: "اسم الموقع يجب أن يحتوي على الأقل على حرفين",
  }),
  siteDescription: z.string().optional(),
  maintenanceMode: z.boolean().default(false),
});

const notificationSettingsFormSchema = z.object({
  enableEmailNotifications: z.boolean().default(true),
  enableBrowserNotifications: z.boolean().default(false),
  adminEmail: z.string().email({
    message: "يرجى إدخال بريد إلكتروني صحيح",
  }),
});

const securitySettingsFormSchema = z.object({
  enableTwoFactor: z.boolean().default(false),
  sessionTimeout: z.string().default("30"),
  allowedIPs: z.string().optional(),
});

type SiteSettingsFormValues = z.infer<typeof siteSettingsFormSchema>;
type NotificationSettingsFormValues = z.infer<typeof notificationSettingsFormSchema>;
type SecuritySettingsFormValues = z.infer<typeof securitySettingsFormSchema>;

const AdminSettings = () => {
  const { toast } = useToast();
  
  // Site settings form
  const siteSettingsForm = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsFormSchema),
    defaultValues: {
      siteName: "مركز تعليم اللغات",
      siteDescription: "منصة متخصصة في تعليم اللغات المختلفة بأساليب مبتكرة",
      maintenanceMode: false,
    },
  });

  // Notification settings form
  const notificationSettingsForm = useForm<NotificationSettingsFormValues>({
    resolver: zodResolver(notificationSettingsFormSchema),
    defaultValues: {
      enableEmailNotifications: true,
      enableBrowserNotifications: false,
      adminEmail: "admin@example.com",
    },
  });

  // Security settings form
  const securitySettingsForm = useForm<SecuritySettingsFormValues>({
    resolver: zodResolver(securitySettingsFormSchema),
    defaultValues: {
      enableTwoFactor: false,
      sessionTimeout: "30",
      allowedIPs: "",
    },
  });

  const onSubmitSiteSettings = (data: SiteSettingsFormValues) => {
    // In a real application, save the settings to a backend
    console.log("Site settings submitted:", data);
    toast({
      title: "تم الحفظ بنجاح",
      description: "تم حفظ إعدادات الموقع",
    });
  };

  const onSubmitNotificationSettings = (data: NotificationSettingsFormValues) => {
    console.log("Notification settings submitted:", data);
    toast({
      title: "تم الحفظ بنجاح",
      description: "تم حفظ إعدادات الإشعارات",
    });
  };

  const onSubmitSecuritySettings = (data: SecuritySettingsFormValues) => {
    console.log("Security settings submitted:", data);
    toast({
      title: "تم الحفظ بنجاح",
      description: "تم حفظ إعدادات الأمان",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">إعدادات النظام</h2>
        <p className="text-muted-foreground">
          إدارة إعدادات النظام وتخصيص المنصة
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>عام</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>الإشعارات</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>الأمان</span>
          </TabsTrigger>
        </TabsList>

        {/* General Site Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الموقع</CardTitle>
              <CardDescription>
                تخصيص الإعدادات الأساسية للموقع
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...siteSettingsForm}>
                <form onSubmit={siteSettingsForm.handleSubmit(onSubmitSiteSettings)} className="space-y-4">
                  <FormField
                    control={siteSettingsForm.control}
                    name="siteName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم الموقع</FormLabel>
                        <FormControl>
                          <Input placeholder="اسم الموقع" {...field} />
                        </FormControl>
                        <FormDescription>
                          هذا الاسم سيظهر في عنوان الصفحة وفي أعلى الموقع
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={siteSettingsForm.control}
                    name="siteDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف الموقع</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="وصف مختصر للموقع"
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          هذا الوصف سيظهر في محركات البحث
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={siteSettingsForm.control}
                    name="maintenanceMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            وضع الصيانة
                          </FormLabel>
                          <FormDescription>
                            عند تفعيل وضع الصيانة، لن يتمكن المستخدمون من الوصول إلى الموقع
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit">حفظ الإعدادات</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الإشعارات</CardTitle>
              <CardDescription>
                إدارة تفضيلات الإشعارات والتنبيهات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationSettingsForm}>
                <form onSubmit={notificationSettingsForm.handleSubmit(onSubmitNotificationSettings)} className="space-y-4">
                  <FormField
                    control={notificationSettingsForm.control}
                    name="enableEmailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            إشعارات البريد الإلكتروني
                          </FormLabel>
                          <FormDescription>
                            إرسال إشعارات عبر البريد الإلكتروني عند حدوث نشاط مهم
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationSettingsForm.control}
                    name="enableBrowserNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            إشعارات المتصفح
                          </FormLabel>
                          <FormDescription>
                            عرض إشعارات مباشرة في المتصفح عند استخدام لوحة التحكم
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationSettingsForm.control}
                    name="adminEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>البريد الإلكتروني للإدارة</FormLabel>
                        <FormControl>
                          <Input placeholder="admin@example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          سيتم إرسال جميع إشعارات النظام إلى هذا البريد الإلكتروني
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">حفظ الإعدادات</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الأمان</CardTitle>
              <CardDescription>
                تكوين إعدادات الأمان وحماية الحساب
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...securitySettingsForm}>
                <form onSubmit={securitySettingsForm.handleSubmit(onSubmitSecuritySettings)} className="space-y-4">
                  <FormField
                    control={securitySettingsForm.control}
                    name="enableTwoFactor"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            المصادقة الثنائية
                          </FormLabel>
                          <FormDescription>
                            تمكين المصادقة الثنائية لجميع المشرفين لتعزيز الأمان
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={securitySettingsForm.control}
                    name="sessionTimeout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مدة انتهاء الجلسة (بالدقائق)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          المدة التي يتم بعدها تسجيل خروج المستخدم تلقائيًا في حالة عدم النشاط
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={securitySettingsForm.control}
                    name="allowedIPs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عناوين IP المسموح بها</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="أدخل عناوين IP المسموح بها (عنوان واحد لكل سطر)"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          اترك هذا الحقل فارغًا للسماح بالوصول من أي عنوان IP
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">حفظ الإعدادات</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
