
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLanguages, createLanguage, deleteLanguage } from "@/api/languages";
import { useToast } from "@/hooks/use-toast";

interface LanguageFormValues {
  name: string;
  nativeName: string;
  flag: string;
}

const AdminLanguages = () => {
  const navigate = useNavigate();
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: languagesResponse, isLoading, error } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages
  });

  const languages = languagesResponse?.data || [];
  
  const form = useForm<LanguageFormValues>({
    defaultValues: {
      name: "",
      nativeName: "",
      flag: ""
    }
  });

  const createMutation = useMutation({
    mutationFn: createLanguage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      setIsAddSheetOpen(false);
      form.reset();
      toast({
        title: "تم إضافة اللغة بنجاح",
        description: "تم إضافة اللغة الجديدة إلى النظام",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إضافة اللغة",
        description: error.message || "حدث خطأ أثناء إضافة اللغة",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLanguage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      toast({
        title: "تم حذف اللغة بنجاح",
        description: "تم حذف اللغة من النظام",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في حذف اللغة",
        description: error.message || "حدث خطأ أثناء حذف اللغة",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: LanguageFormValues) => {
    createMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه اللغة؟")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">إدارة اللغات</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>جاري التحميل...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">إدارة اللغات</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">خطأ في تحميل البيانات</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">إدارة اللغات</h1>
        <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              إضافة لغة جديدة
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px]">
            <SheetHeader>
              <SheetTitle className="text-right">إضافة لغة جديدة</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم اللغة بالعربية</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: الإنجليزية" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="nativeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم اللغة الأصلي</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: English" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="flag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رمز العلم</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: 🇬🇧" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddSheetOpen(false)}
                      className="ml-2"
                    >
                      إلغاء
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>قائمة اللغات ({languages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العلم</TableHead>
                <TableHead>اسم اللغة</TableHead>
                <TableHead>الاسم الأصلي</TableHead>
                <TableHead className="w-[100px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {languages.map((language) => (
                <TableRow key={language.id}>
                  <TableCell>{language.flag}</TableCell>
                  <TableCell>{language.name}</TableCell>
                  <TableCell>{language.nativeName}</TableCell>
                  <TableCell className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => navigate(`/admin/edit-language/${language.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">تعديل</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(language.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">حذف</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLanguages;
