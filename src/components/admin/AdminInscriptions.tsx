
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Search, FileText } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import api from "@/config/axios";
import { Badge } from "@/components/ui/badge";

const AdminInscriptions = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    data: inscriptions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["inscriptions"],
    queryFn: () => api.get("/inscriptions").then((res) => res.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api.delete(`/inscriptions/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inscriptions"] });
      toast({
        title: "Inscription deleted",
        description: "The inscription has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete inscription",
        variant: "destructive",
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) =>
      api.patch(`/inscriptions/${id}/approve`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inscriptions"] });
      toast({
        title: "Inscription approved",
        description: "The inscription has been approved and user created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Approval failed",
        description: error.message || "Failed to approve inscription",
        variant: "destructive",
      });
    },
  });

  // Filter inscriptions based on search term
  const filteredInscriptions = useMemo(() => {
    if (!inscriptions || !searchTerm) return inscriptions || [];

    return inscriptions.filter(
      (inscription: any) =>
        inscription.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inscription.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inscription.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inscription.phone.includes(searchTerm)
    );
  }, [inscriptions, searchTerm]);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this inscription?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleApprove = (id: string) => {
    if (confirm("Are you sure you want to approve this inscription?")) {
      approveMutation.mutate(id);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return <Badge variant="default">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Inscriptions</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Inscriptions</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error loading inscriptions</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Inscriptions Management</h2>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-2" />
            <Input
              placeholder="Search inscriptions..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-8 rtl:pr-8 rtl:pl-3"
            />
          </div>
          <Button onClick={() => navigate("/admin/add-user")}>
            <UserPlus className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
            New Inscription
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead className="text-left rtl:text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8">
                  {searchTerm
                    ? "No inscriptions found matching your search"
                    : "No inscriptions found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredInscriptions.map((inscription: any) => (
                <TableRow key={inscription.id}>
                  <TableCell>{inscription.id}</TableCell>
                  <TableCell>
                    {inscription.first_name} {inscription.last_name}
                  </TableCell>
                  <TableCell>{inscription.email}</TableCell>
                  <TableCell>{inscription.phone}</TableCell>
                  <TableCell>{inscription.age}</TableCell>
                  <TableCell>{inscription.language?.name || "N/A"}</TableCell>
                  <TableCell className="capitalize">{inscription.level}</TableCell>
                  <TableCell className="capitalize">{inscription.type}</TableCell>
                  <TableCell>
                    {getStatusBadge(inscription.status || "pending")}
                  </TableCell>
                  <TableCell>
                    {new Date(inscription.start_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    {inscription.status !== "approved" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(inscription.id)}
                        disabled={approveMutation.isPending}
                      >
                        Approve
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(inscription.id)}
                      disabled={deleteMutation.isPending}
                    >
                      Delete
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

export default AdminInscriptions;
