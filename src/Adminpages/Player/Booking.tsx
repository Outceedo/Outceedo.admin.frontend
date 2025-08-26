import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";

import {
  FileText,
  FileX2,
  Trash2,
  Edit2,
  Eye,
  MoreHorizontal,
} from "lucide-react";

// Define a booking type
type BookingType = {
  id: string;
  date: string;
  player: string;
  playerSecondary: string;
  expert: string;
  expertSecondary: string;
  assessment: string;
  amount: number;
  report?: { id: string; date: string };
  cycle: string;
};

const bookings: BookingType[] = [
  {
    id: "#001",
    date: "Mon Jan 01 2024 10:00",
    player: "Player One",
    playerSecondary: "Secondary info",
    expert: "Expert One",
    expertSecondary: "Secondary info",
    assessment: "Online Video Assessment",
    amount: 719.0,
    report: { id: "923", date: "Sun Nov 26 2023 11:46" },
    cycle: "Single time",
  },
  
  {
    id: "#002",
    date: "Mon Jan 01 2024 10:00",
    player: "Player One",
    playerSecondary: "Secondary info",
    expert: "Expert One",
    expertSecondary: "Secondary info",
    assessment: "Online Video Assessment",
    amount: 919.0,
    report: { id: "923", date: "Sun Jan 2 2023 1:46" },
    cycle: "Single time",
  },
  
   {
    id: "#001",
    date: "Mon Jan 01 2024 10:00",
    player: "Player One",
    playerSecondary: "Secondary info",
    expert: "Expert One",
    expertSecondary: "Secondary info",
    assessment: "Online Video Assessment",
    amount: 719.0,
    report: { id: "923", date: "Sun Nov 26 2023 11:46" },
    cycle: "Single time",
  },
  
  {
    id: "#002",
    date: "Mon Jan 01 2024 10:00",
    player: "Player One",
    playerSecondary: "Secondary info",
    expert: "Expert One",
    expertSecondary: "Secondary info",
    assessment: "Online Video Assessment",
    amount: 919.0,
    report: { id: "923", date: "Sun Jan 2 2023 1:46" },
    cycle: "Single time",
  },
    {
    id: "#001",
    date: "Mon Jan 01 2024 10:00",
    player: "Player One",
    playerSecondary: "Secondary info",
    expert: "Expert One",
    expertSecondary: "Secondary info",
    assessment: "Online Video Assessment",
    amount: 719.0,
    report: { id: "923", date: "Sun Nov 26 2023 11:46" },
    cycle: "Single time",
  },
  
  {
    id: "#002",
    date: "Mon Jan 01 2024 10:00",
    player: "Player One",
    playerSecondary: "Secondary info",
    expert: "Expert One",
    expertSecondary: "Secondary info",
    assessment: "Online Video Assessment",
    amount: 919.0,
    report: { id: "923", date: "Sun Jan 2 2023 1:46" },
    cycle: "Single time",
  },
   {
    id: "#001",
    date: "Mon Jan 01 2024 10:00",
    player: "Player One",
    playerSecondary: "Secondary info",
    expert: "Expert One",
    expertSecondary: "Secondary info",
    assessment: "Online Video Assessment",
    amount: 719.0,
    report: { id: "923", date: "Sun Nov 26 2023 11:46" },
    cycle: "Single time",
  },
  
  {
    id: "#002",
    date: "Mon Jan 01 2024 10:00",
    player: "Player One",
    playerSecondary: "Secondary info",
    expert: "Expert One",
    expertSecondary: "Secondary info",
    assessment: "Online Video Assessment",
    amount: 919.0,
    report: { id: "923", date: "Sun Jan 2 2023 1:46" },
    cycle: "Single time",
  },
   {
    id: "#001",
    date: "Mon Jan 01 2024 10:00",
    player: "Player One",
    playerSecondary: "Secondary info",
    expert: "Expert One",
    expertSecondary: "Secondary info",
    assessment: "Online Video Assessment",
    amount: 719.0,
    report: { id: "923", date: "Sun Nov 26 2023 11:46" },
    cycle: "Single time",
  },
  
  {
    id: "#002",
    date: "Mon Jan 01 2024 10:00",
    player: "Player One",
    playerSecondary: "Secondary info",
    expert: "Expert One",
    expertSecondary: "Secondary info",
    assessment: "Online Video Assessment",
    amount: 919.0,
    report: { id: "923", date: "Sun Jan 2 2023 1:46" },
    cycle: "Single time",
  },
  




];

const Booking = () => {
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("October");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  const totalPages = Math.ceil(bookings.length / pageSize);
  const paginatedBookings = bookings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    const fetchMonths = () => {
      const monthList: string[] = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      setTimeout(() => {
        setMonths(monthList);
      }, 500);
    };

    fetchMonths();
  }, []);

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold">Booking Experts</h2>
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <select
            className="border px-3 py-2 rounded-md bg-white font-medium text-gray-700 w-full sm:w-40"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {months.map((month, index) => (
              <option key={index} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-lg shadow-sm border bg-white dark:bg-gray-800 dark:border-gray-700 ">
        <Table >
          <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl">
            <TableRow>
              <TableHead ></TableHead>
              <TableHead >Player's Name</TableHead>
              <TableHead >Expert's Name</TableHead>
              <TableHead >Booking Type</TableHead>
              <TableHead >Booking Fee's</TableHead>
              <TableHead >Reports</TableHead>
              <TableHead >Booking Cycle</TableHead>
              <TableHead >Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedBookings.map((booking, index) => (
              <TableRow
                key={index}
                className="border-b last:border-b-0 "
              >
                <TableCell className="px-4 py-2 align-middle">
                  <Checkbox />
                </TableCell>
              <TableCell className="px-4 py-2 align-middle">
  
      <Link
        to={`/player/${booking.id}`}
        className="underline font-medium text-blue-600 hover:text-blue-800 "
      >
        {booking.player}
      </Link>
      <div className="text-xs text-gray-500 dark:text-white">{booking.playerSecondary}</div>
  
</TableCell>

<TableCell className="px-4 py-2 align-middle">
 
    
      <Link
        to={`/expert/${booking.id}`}
        className="underline font-medium text-blue-600 hover:text-blue-800 "
      >
        {booking.expert}
      </Link>
      <div className="text-xs text-gray-500 dark:text-white">{booking.expertSecondary}</div>
    
</TableCell>

                <TableCell className="px-4 py-2 align-middle">
                  <span className="block">{booking.assessment}</span>
                </TableCell>
                <TableCell className="px-4 py-2 align-middle font-semibold">
                  £{booking.amount.toFixed(2)}
                </TableCell>
                <TableCell className="px-4 py-2 align-middle">
                  {booking.report ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-700 dark:text-white">
                          Report #{booking.report.id}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-white">
                        {booking.report.date}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <FileX2 className="w-4 h-4 text-gray-400 dark:text-white"  />
                      <span className="text-gray-400">No Report</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="px-4 py-2 align-middle">
                  <span className="text-gray-700 dark:text-white">{booking.cycle}</span>
                </TableCell>
                <TableCell className="px-4 py-2 align-middle">
                  <div className="flex gap-2">
                    <button className="text-red-600 hover:bg-red-50 rounded-full p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="text-gray-700 hover:bg-blue-50 rounded-full p-1 dark:text-white">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="text-gray-700 hover:bg-gray-100 rounded-full p-1 dark:text-white">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-700 hover:bg-gray-100 rounded-full p-1 dark:text-white">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2 text-sm text-gray-500 dark:text-white">
        <div>
          Showing {Math.min((currentPage - 1) * pageSize + 1, bookings.length)}–
          {Math.min(currentPage * pageSize, bookings.length)} out of{" "}
          {bookings.length}
        </div>

        <div className="flex gap-1">
          <button
            className="border px-2 rounded"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            ⟨
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`border px-2 rounded ${
                currentPage === i + 1 ? "bg-gray-300" : ""
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="border px-2 rounded"
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

export default Booking;
