import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, MoreVertical, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// Random enrollment numbers for demo
const teams = [
  { name: "Team A", registered: "15th May 2024", services: "Training and Enrollments", enrollments: 8, status: "Active" },
  { name: "Team B", registered: "22nd June 2024", services: "Training and Enrollments", enrollments: 12, status: "Inactive" },
  { name: "Team C", registered: "03rd July 2024", services: "Training and Enrollments", enrollments: 6, status: "Active" },
  { name: "Team D", registered: "12th August 2024", services: "Training and Enrollments", enrollments: 10, status: "Inactive" },
  { name: "Team E", registered: "01st July 2024", services: "Training and Enrollments", enrollments: 14, status: "Active" },
  { name: "Team F", registered: "05th July 2024", services: "Training and Enrollments", enrollments: 9, status: "Inactive" },
  { name: "Team G", registered: "10th July 2024", services: "Training and Enrollments", enrollments: 11, status: "Active" },
  { name: "Team H", registered: "15th July 2024", services: "Training and Enrollments", enrollments: 7, status: "Inactive" },
];

const RegisteredTeams: React.FC = () => {
  const [months, setMonths] = useState<string[]>([]);

  useEffect(() => {
    const monthList = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    setTimeout(() => setMonths(monthList), 500);
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Team Details</h2>

        <div className="flex items-center gap-2">
          <div className="relative w-full dark:bg-slate-600 dark:text-white rounded-lg">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name"
              className="pl-9 w-full dark:bg-slate-700 text-sm sm:text-base"
            />
          </div>

          <select className="border px-3 py-2 rounded-md dark:bg-gray-900">
            {months.map((month, index) => (
              <option key={index} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className=" rounded-lg shadow-sm border bg-white dark:bg-gray-800 dark:border-gray-700">
        <Table>
          <TableHeader className="bg-blue-100  text-xl  dark:bg-blue-900">
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Team Name</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead>Services Offered</TableHead>
              <TableHead>Enrollments</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {teams.map((team, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell>
                  <a href="#" className="text-blue-600 hover:underline">
                    {team.name}
                  </a>
                </TableCell>
                <TableCell>{team.registered}</TableCell>
                <TableCell>{team.services}</TableCell>
                <TableCell>{team.enrollments}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      team.status === "Active"
                        ? "bg-green-200 text-green-800 p-1 w-16"
                        : "bg-yellow-200 text-yellow-800 p-1 w-16"
                    }
                  >
                    {team.status}
                  </Badge>
                </TableCell>
                <TableCell className="flex gap-2 justify-center">
                  <Button size="icon" variant="ghost">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Pencil className="w-4 h-4 text-gray-600 dark:text-white" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Eye className="w-4 h-4 text-gray-600 dark:text-white" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <MoreVertical className="w-4 h-4 text-gray-600 dark:text-white" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-white">
        <div>Showing 1 out of 100</div>
        <div className="flex gap-1">
          <button className="border px-2 rounded">⟨</button>
          <button className="border px-2 rounded bg-gray-200">1</button>
          <button className="border px-2 rounded">2</button>
          <button className="border px-2 rounded">⟩</button>
        </div>
      </div>
    </div>
  );
};

export default RegisteredTeams;
