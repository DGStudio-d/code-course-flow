import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import useUsers from "@/hooks/useUsers";

const AdminUsers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { t } = useTranslation();
  const { deleteMutation, usersResponse, isLoading, error } = useUsers();



  const users = usersResponse?.data || [];

  // Delete user mutation
  

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    
    return users.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm)
    );
  }, [users, searchTerm]);

  const handleDelete = (id: string) => {
    if (confirm(t("admin.users.messages.deleteConfirm"))) {
      deleteMutation.mutate(id);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t("admin.users.title")}</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.users.loading")}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t("admin.users.title")}</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">{t("admin.users.loadError")}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("admin.users.title")}</h2>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-2" />
            <Input 
              placeholder={t("admin.users.search")}
              value={searchTerm}
              onChange={handleSearch}
              className="pl-8 rtl:pr-8 rtl:pl-3"
            />
          </div>
          <Button onClick={() => navigate("/admin/add-user")}>
            <UserPlus className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
            {t("admin.users.addNew")}
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.users.table.id")}</TableHead>
              <TableHead>{t("admin.users.table.name")}</TableHead>
              <TableHead>{t("admin.users.table.email")}</TableHead>
              <TableHead>{t("admin.users.table.phone")}</TableHead>
              <TableHead>{t("admin.users.table.registrationDate")}</TableHead>
              <TableHead className="text-left rtl:text-right">{t("admin.users.table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {searchTerm ? t("admin.users.noUsers") : t("admin.users.noUsers")}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    {new Date(user.registrationDate || user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/admin/edit-user/${user.id}`)}
                    >
                      {t("admin.users.table.edit")}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {t("admin.users.table.delete")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminUsers;