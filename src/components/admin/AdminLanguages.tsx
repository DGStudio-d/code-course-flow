import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Globe } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLanguages, createLanguage, deleteLanguage } from "@/api/languages";
import { useToast } from "@/hooks/use-toast";

interface LanguageFormValues {
  name: string;
  nativeName: string;
  flag: string;
}

const AdminLanguages = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<LanguageFormValues>({
    name: "",
    nativeName: "",
    flag: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: languages, isLoading } = useQuery({
    queryKey: ["languages"],
    queryFn: getLanguages,
  });

  const createLanguageMutation = useMutation({
    mutationFn: createLanguage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["languages"] });
      setShowAddForm(false);
      setFormData({ name: "", nativeName: "", flag: "" });
      toast({
        title: "Success",
        description: "Language created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create language",
        variant: "destructive",
      });
    },
  });

  const deleteLanguageMutation = useMutation({
    mutationFn: deleteLanguage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["languages"] });
      toast({
        title: "Success",
        description: "Language deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete language",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.nativeName && formData.flag) {
      createLanguageMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this language?")) {
      deleteLanguageMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Language Management</h1>
          <p className="text-gray-600 mt-2">Manage available languages for courses and quizzes</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Language
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Language</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Language Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., English"
                  required
                />
              </div>
              <div>
                <Label htmlFor="nativeName">Native Name</Label>
                <Input
                  id="nativeName"
                  type="text"
                  value={formData.nativeName}
                  onChange={(e) => setFormData({ ...formData, nativeName: e.target.value })}
                  placeholder="e.g., English"
                  required
                />
              </div>
              <div>
                <Label htmlFor="flag">Flag (emoji or URL)</Label>
                <Input
                  id="flag"
                  type="text"
                  value={formData.flag}
                  onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                  placeholder="e.g., 🇺🇸"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createLanguageMutation.isPending}>
                  {createLanguageMutation.isPending ? "Creating..." : "Create Language"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {isLoading ? (
          <div>Loading languages...</div>
        ) : (
          languages?.data?.map((language: any) => (
            <Card key={language.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{language.flag}</span>
                  <div>
                    <h3 className="font-semibold">{language.name}</h3>
                    <p className="text-sm text-gray-600">{language.nativeName}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(language.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminLanguages;
