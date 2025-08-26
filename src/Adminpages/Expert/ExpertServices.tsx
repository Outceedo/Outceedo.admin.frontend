import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";


const expertservice = [
  {
    
    player: "Player Name",
    expert: "Expert Name",
    service: "1-on-1 Online Training or advice",
    amount: 198.0,
    date:"1 may 2020",
    status: "Completed",
    report: true,
  },
  {
    
    player: "Player Name",
    expert: "Expert Name",
    service: "Online Video Assessment",
    amount: 674.0,
     date:"1 may 2020",
    status: "Completed",
    report: false,
  },
  {
    
    player: "Player Name",
    expert: "Expert Name",
    service: "On-Field Live Assessment",
    amount: 393.0,
     date:"1 may 2020",
    status: "Completed",
    report: true,
  },
  {
    
    player: "Player Name",
    expert: "Expert Name",
    service: "1-on-1 Online Training or advice",
    amount: 731.0,
     date:"1 may 2020",
    status: "Pending",
    report: false,
  },
  {
  
    player: "Player Name",
    expert: "Expert Name",
    service: "Online Video Assessment",
    amount: 197.0,
     date:"1 may 2020",
    status: "Pending",
    report: true,
  },
  {
    
    player: "Player Name",
    expert: "Expert Name",
    service: "1-on-1 Online Training or advice",
    amount: 970.0,
     date:"1 may 2020",
    status: "Completed",
    report: true,
  },
  {
  
    player: "Player Name",
    expert: "Expert Name",
    service: "On-Field Live Assessment",
    amount: 448.0,
     date:"1 may 2020",
    status: "Pending",
    report: false,
  },
  {
    
    player: "Player Name",
    expert: "Expert Name",
    service: "Online Video Assessment",
    amount: 764.0,
     date:"1 may 2020",
    status: "Completed",
    report: true,
  },
  {
    
    player: "Player Name",
    expert: "Expert Name",
    service: "On-Field Live Assessment",
    amount: 385.0,
     date:"1 may 2020",
    status: "Pending",
    report: true,
  },
];

const ExpertServices: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.ceil(expertservice.length / pageSize);
  const paginatedService = expertservice.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const [months, setMonths] = useState<string[]>([]);
   useEffect(() => {
    const monthList = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    setTimeout(() => {
      setMonths(monthList);
    }, 500);
  }, []);

  return (
   <div className="p-6">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
     <h2 className="text-xl md:text-2xl font-semibold">Services Offered</h2>
   
     <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
       <div className="relative w-full sm:w-64 dark:bg-slate-600 dark:text-white rounded-lg">
         <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
         <Input
           type="text"
           placeholder="Search by name"
           className="pl-9 w-full dark:bg-slate-700 text-sm sm:text-base"
         />
       </div>
   
       <select className="border px-3 py-2 rounded-md dark:bg-gray-900 w-full sm:w-auto">
         {months.map((month, index) => (
           <option key={index} value={month}>
             {month}
           </option>
         ))}
       </select>
     </div>
   </div>

        <div className="rounded-lg shadow-sm border bg-white dark:bg-gray-800 dark:border-gray-700">
        <Table className="min-w-[1000px]">
          <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl">
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Expert Name</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Service Fee</TableHead>
              <TableHead>Service Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedService.map((expert) => (
              <TableRow key={expert.expert}>
                <TableCell>
                  <Checkbox />
                </TableCell>

                <TableCell>
                  
                    <Link
                      to={`/expert/${expert.expert}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {expert.expert}
                    </Link>
                  
                </TableCell>

                <TableCell className="text-sm">{expert.service}</TableCell>
                <TableCell className="font-semibold text-sm">£{expert.amount.toFixed(2)}</TableCell>
                <TableCell className="text-sm">{expert.date}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      expert.status === "Completed"
                        ? "bg-green-200 text-green-800 p-2 w-20 text-center"
                        : "bg-yellow-200 text-yellow-800 p-2 w-20 text-center"
                    }
                  >
                    {expert.status}
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

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 text-sm text-gray-500 dark:text-white">
        <div className="text-center sm:text-left w-full sm:w-auto">
          Showing {Math.min((currentPage - 1) * pageSize + 1, expertservice.length)}–
          {Math.min(currentPage * pageSize, expertservice.length)} of {expertservice.length}
        </div>

        <div className="flex flex-wrap justify-center gap-1 w-full sm:w-auto">
          <button
            className="border px-2 py-1 rounded"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            ⟨
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`border px-3 py-1 rounded ${
                currentPage === i + 1 ? "bg-gray-300 font-semibold" : ""
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="border px-2 py-1 rounded"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          >
            ⟩
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpertServices;
