
import React from "react";
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
import { UserPlus, Search } from "lucide-react";

// Dummy data for users
const users = [
  { id: 1, name: "محمد أحمد", email: "mohamed@example.com", phone: "050-1234567", registrationDate: "2023-05-12" },
  { id: 2, name: "فاطمة علي", email: "fatima@example.com", phone: "055-7654321", registrationDate: "2023-06-20" },
  { id: 3, name: "عبدالله محمد", email: "abdullah@example.com", phone: "054-9876543", registrationDate: "2023-07-15" },
  { id: 4, name: "نورة سالم", email: "noura@example.com", phone: "056-3216549", registrationDate: "2023-08-02" },
  { id: 5, name: "خالد عمر", email: "khaled@example.com", phone: "058-7412589", registrationDate: "2023-09-10" },
];

const AdminUsers = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">المستخدمين</h2>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="بحث عن مستخدم..." 
              className="pl-8 rtl:pr-8 rtl:pl-3"
            />
          </div>
          <Button onClick={() => navigate("/admin/add-user")}>
            <UserPlus className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
            إضافة مستخدم
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الرقم</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>رقم الهاتف</TableHead>
              <TableHead>تاريخ التسجيل</TableHead>
              <TableHead className="text-left rtl:text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.registrationDate}</TableCell>
                <TableCell className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/admin/edit-user/${user.id}`)}
                  >
                    تعديل
                  </Button>
                  <Button variant="destructive" size="sm">حذف</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminUsers;
