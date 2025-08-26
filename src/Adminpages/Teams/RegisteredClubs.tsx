
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Pencil, Trash2, MoreVertical ,Search} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
const statusBadge = (status: string) => {
  switch (status) {
    case "Active":
      return <Badge className="bg-green-100 text-green-600">Active</Badge>;
    case "Inactive":
      return <Badge className="bg-yellow-100 text-yellow-600">Inactive</Badge>;
    default:
      return null;
  }
};

const data = [
  { id: 1, name: "User name", date: "18th June 2025", service: "Coaching", enrollments: 28, status: "Inactive" },
  { id: 2, name: "User name", date: "18th June 2025", service: "Coaching", enrollments: 16, status: "Active" },
  { id: 3, name: "User name", date: "18th June 2025", service: "Coaching", enrollments: 23, status: "Active" },
  { id: 4, name: "User name", date: "18th June 2025", service: "Coaching", enrollments: 11, status: "Active" },
  { id: 5, name: "User name", date: "18th June 2025", service: "Coaching", enrollments: 28, status: "Inactive" },
  { id: 6, name: "User name", date: "18th June 2025", service: "Coaching", enrollments: 23, status: "Active" },
  { id: 7, name: "User name", date: "18th June 2025", service: "Coaching", enrollments: 11, status: "Inactive" },
  { id: 8, name: "User name", date: "18th June 2025", service: "Coaching", enrollments: 16, status: "Inactive" },
  { id: 9, name: "User name", date: "18th June 2025", service: "Coaching", enrollments: 23, status: "Inactive" },
  { id: 10, name: "User name", date: "18th June 2025", service: "Coaching", enrollments: 28, status: "Inactive" },
];

const RegisteredClubs: React.FC = () => {
   const [months, setMonths] = useState<string[]>([]);
  
    useEffect(() => {
      const fetchMonths = () => {
        const monthList = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        setTimeout(() => {
          setMonths(monthList);
        }, 500);
      };
  
      fetchMonths();
    }, []);
  return (
    <div className="">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Registered Clubs</h2>

         <div className="flex items-center gap-2">
          <div className="relative w-full rounded-lg">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name"
              className="pl-9 w-full bg-white dark:bg-gray-800 dark:text-white text-sm sm:text-base"
            />
          </div>

          <select className="border px-3 py-2 rounded-md bg-white dark:bg-gray-800 dark:text-white">
            {months.map((month, index) => (
              <option key={index} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>

       <div className="rounded-lg shadow-sm border bg-white dark:bg-gray-800 dark:border-gray-700">
      <Table>
        <TableHeader className=" bg-blue-100 dark:bg-blue-900 text-xl ">
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Club Name</TableHead>
            <TableHead>Registration Date</TableHead>
            <TableHead>Services Offered</TableHead>
            <TableHead>Enrollments</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell><Checkbox /></TableCell>
              <TableCell><a
    href="#"
    className="text-blue-600 underline dark:text-blue-400"
  >
    {item.name}
    
  </a></TableCell>
              <TableCell>{item.date}</TableCell>
              <TableCell>{item.service}</TableCell>
              <TableCell>{item.enrollments}</TableCell>
              <TableCell>{statusBadge(item.status)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Trash2 className="w-4 h-4 text-pink-600" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
</div>
      <div className="text-sm mt-4 flex justify-between text-gray-600 dark:text-gray-300">
            <span>Showing 1 out of 100</span>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost">
                {"<"}
              </Button>
              <Button size="sm" variant="outline" className="dark:text-white">
                1
              </Button>
              <Button size="sm" variant="ghost">
                2
              </Button>
              <Button size="sm" variant="ghost">
                {">"}
              </Button>
            </div>
          </div>
    </div>
  );
};

export default RegisteredClubs;
