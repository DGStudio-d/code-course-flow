import React, { useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLanguages, createLanguage, deleteLanguage } from "@/api/languages";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const {
    data: languagesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["languages"],
    queryFn: getLanguages,
  });

  const languages = languagesResponse?.data || [];

  const form = useForm<LanguageFormValues>({
    defaultValues: {
      name: "",
      nativeName: "",
      flag: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createLanguage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["languages"] });
      setIsAddSheetOpen(false);
      form.reset();
      toast({
        title: t("admin.languages.messages.addSuccess"),
        description: t("admin.languages.messages.addSuccessDesc"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("admin.languages.messages.addError"),
        description:
          error.message || t("admin.languages.messages.addErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLanguage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["languages"] });
      toast({
        title: t("admin.languages.messages.deleteSuccess"),
        description: t("admin.languages.messages.deleteSuccessDesc"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("admin.languages.messages.deleteError"),
        description:
          error.message || t("admin.languages.messages.deleteErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LanguageFormValues) => {
    createMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (confirm(t("admin.languages.messages.deleteConfirm"))) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("admin.languages.title")}
          </h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.languages.loading")}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("admin.languages.title")}
          </h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">
              {t("admin.languages.loadError")}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("admin.languages.title")}
        </h1>
        <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("admin.languages.addNew")}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px]">
            <SheetHeader>
              <SheetTitle className="text-right">
                {t("admin.languages.form.addTitle")}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("admin.languages.form.nameLabel")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t(
                              "admin.languages.form.namePlaceholder"
                            )}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nativeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("admin.languages.form.nativeNameLabel")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t(
                              "admin.languages.form.nativeNamePlaceholder"
                            )}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="flag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("admin.languages.form.flagLabel")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t(
                              "admin.languages.form.flagPlaceholder"
                            )}
                            {...field}
                          />
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
                      {t("admin.languages.form.cancel")}
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending
                        ? t("admin.languages.form.saving")
                        : t("admin.languages.form.save")}
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
          <CardTitle>
            {t("admin.languages.list")} ({languages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.languages.table.flag")}</TableHead>
                <TableHead>{t("admin.languages.table.name")}</TableHead>
                <TableHead>{t("admin.languages.table.nativeName")}</TableHead>
                <TableHead className="w-[100px]">
                  {t("admin.languages.table.actions")}
                </TableHead>
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
                      onClick={() =>
                        navigate(`/admin/edit-language/${language.id}`)
                      }
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">
                        {t("admin.languages.table.edit")}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(language.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">
                        {t("admin.languages.table.delete")}
                      </span>
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
