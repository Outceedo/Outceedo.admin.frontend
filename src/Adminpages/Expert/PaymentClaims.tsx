import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Eye, Pencil, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
const paymentData = [
  {
    expert: "Aarav Kumar",
    player: "Riya Sen",
    service: "Fitness Coaching",
    amount: 1500,
    report:"report ",
    date:"tue, 2 may 2024",
    status: "Paid",
  },
  {
    expert: "Meera Sharma",
    player: "Kabir Mehta",
    service: "Nutrition Plan",
    amount: 1200,
     report:"report ",
    date:"tue, 2 may 2024",
    status: "Pending",
  },
  {
     expert: "Aarav Kumar",
    player: "Riya Sen",
    service: "Strength Training",
    amount: 1800,
     report:"report ",
    date:"tue, 2 may 2024",
    status: "Paid",
  },
   {
    expert: "Aarav Kumar",
    player: "Riya Sen",
    service: "Fitness Coaching",
    amount: 1500,
     report:"report ",
    date:"tue, 2 may 2024",
    status: "Paid",
  },
  {
    expert: "Meera Sharma",
    player: "Kabir Mehta",
    service: "Nutrition Plan",
    amount: 1200,
     report:"report ",
    date:"tue, 2 may 2024",
    status: "Pending",
  },
  {
    expert: "Aarav Kumar",
    player: "Riya Sen",
    service: "Strength Training",
    amount: 1800,
     report:"report ",
    date:"tue, 2 may 2024",
    status: "Paid",
  },
   {
    expert: "Aarav Kumar",
    player: "Riya Sen",
    service: "Fitness Coaching",
    amount: 1500,
     report:"report ",
    date:"tue, 2 may 2024",
    status: "Paid",
  },
  {
    expert: "Meera Sharma",
    player: "Kabir Mehta",
    service: "Nutrition Plan",
    amount: 1200,
     report:"report ",
    date:"tue, 2 may 2024",
    status: "Pending",
  },
  {
    expert: "Aarav Kumar",
    player: "Riya Sen",
    service: "Strength Training",
    amount: 1800,
     report:"report ",
    date:"tue, 2 may 2024",
    status: "Paid",
  },
];
const getStatusBadge = (status: string) => {
  switch (status) {
    case "Paid":
      return "bg-green-200 text-green-800 w-full p-1.5";
    case "Pending":
      return "bg-yellow-200 text-yellow-800 w-full p-1.5";
    default:
      return "bg-gray-200 text-gray-700";
  }
};

const PaymentClaims: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(paymentData.length / pageSize);
  const paginatedpaymentData = paymentData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Transaction/Claims</h2>
      </div>

       <div className="rounded-lg shadow-sm border bg-white dark:bg-gray-800 dark:border-gray-700">
        <Table>
          <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl">
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Experts Name</TableHead>
              <TableHead>Players Name</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Service Fee</TableHead>
              <TableHead>Reports</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedpaymentData.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox />
                </TableCell>

                <TableCell>
                 
                    <Link to={`/expert/${index + 1}`} className="text-blue-600 hover:underline">
                      {item.expert}
                    </Link>
                  
                </TableCell>

                <TableCell>
                
                    <Link to={`/player/${index + 1}`} className="text-blue-600 hover:underline">
                      {item.player}
                    </Link>
                  
                </TableCell>

                <TableCell>{item.service}</TableCell>
                <TableCell className="font-bold"> £ {item.amount}</TableCell>
                  <TableCell>
                    <div className="text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <div>
                        <div>{item.report}</div>
                        <div>{item.date}</div>
                      </div>
                    </div>
                  </TableCell>
                <TableCell>
                  <Badge className={`text-xs px-2 ${getStatusBadge(item.status)}`}>{item.status}</Badge>
                </TableCell>

                <TableCell>
                  <div className="flex gap-2 justify-center">
                    <Button size="icon" variant="ghost">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <Pencil className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 text-sm text-gray-500 dark:text-white">
        <div className="text-center sm:text-left w-full sm:w-auto">
          Showing {Math.min((currentPage - 1) * pageSize + 1, paymentData.length)}–
          {Math.min(currentPage * pageSize, paymentData.length)} of {paymentData.length}
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
              className={`border px-3 py-1 rounded ${currentPage === i + 1 ? "bg-gray-300 font-semibold" : ""}`}
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

export default PaymentClaims;
