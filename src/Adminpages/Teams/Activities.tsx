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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pencil, Trash2, Eye, MoreVertical, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const data = [
  { result: "-", status: "Pending" },
  { result: "Win", status: "Completed" },
  { result: "-", status: "Pending" },
  { result: "Runner up", status: "Completed" },
  { result: "-", status: "Pending" },
  { result: "Runner up", status: "Completed" },
  { result: "-", status: "Pending" },
  { result: "Win", status: "Completed" },
  { result: "-", status: "Pending" },
  { result: "Win", status: "Completed" },
];

const getStatusBadge = (status: string) => {
  return (
    <Badge
      className={
        status === "Completed"
          ? "bg-green-200 text-green-800 dark:bg-green-700 dark:text-white"
          : "bg-yellow-200 text-yellow-800 dark:bg-yellow-600 dark:text-white"
      }
    >
      {status}
    </Badge>
  );
};

const Activities: React.FC = () => {
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Team Activities
        </h2>

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
          <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl ">
            <TableRow>
              <TableHead>
                
              </TableHead>
              <TableHead>Team Name</TableHead>
              <TableHead>Activity Date</TableHead>
              <TableHead>Sponsor Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Results</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index} className="dark:hover:bg-gray-700">
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell className="dark:text-white">  <a
    href="#"
    className="text-blue-600 underline dark:text-blue-400"
  >
    User name
  </a></TableCell>
                <TableCell className="dark:text-white">
                  18th June 2025
                </TableCell>
                <TableCell className="dark:text-white">
                   <a
    href="#"
    className="text-blue-600 underline dark:text-blue-400"
  >
    User name
  </a>
                </TableCell>
                <TableCell className="dark:text-white">Wales</TableCell>
                <TableCell className="dark:text-white">{item.result}</TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell className="flex gap-2">
                  <Button size="icon" variant="ghost">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Pencil className="w-4 h-4 text-gray-500" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Eye className="w-4 h-4 text-gray-700 dark:text-white" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreVertical className="w-4 h-4 dark:text-white" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="dark:bg-gray-900 dark:border-gray-700">
                      <DropdownMenuItem className="dark:text-white">
                        Action 1
                      </DropdownMenuItem>
                      <DropdownMenuItem className="dark:text-white">
                        Action 2
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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

export default Activities;
