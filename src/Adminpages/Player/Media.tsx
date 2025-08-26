import { useState } from "react";
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
  Trash2,
  Eye,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Sample data
const mediaData = [
  { id: 1, name: "User name",  status: "Pending" },
  { id: 2, name: "User name",  status: "Completed" },
  { id: 3, name: "User name",  status: "Pending" },
  { id: 4, name: "User name",  status: "Completed" },
  { id: 5, name: "User name",  status: "Pending" },
  { id: 6, name: "User name",  status: "Completed" },
  { id: 7, name: "User name",  status: "Pending" },
  { id: 8, name: "User name", status: "Completed" },
  { id: 9, name: "User name",  status: "Pending" },
  { id: 10, name: "User name",  status: "Completed" },
];

const statusClass = (status: string) =>
  status === "Completed"
    ? "bg-green-100 text-green-700"
    : "bg-yellow-100 text-yellow-700";

const Media = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(mediaData.length / pageSize);
  const paginatedMedia = mediaData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-semibold">Player's Media</h2>
      </div>

      <div className="rounded-xl border bg-white overflow-x-auto shadow-sm dark:bg-gray-800">
        <Table className="min-w-[1000px]">
          <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl ">
            <TableRow>
              <TableHead />
              <TableHead >Players Name</TableHead>
              <TableHead >Audio</TableHead>
              <TableHead >Videos</TableHead>
              <TableHead >Awards</TableHead>
              <TableHead >Certificates</TableHead>
              <TableHead >Status</TableHead>
              <TableHead >Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedMedia.map((player, idx) => (
              <TableRow key={idx} className="border-b last:border-b-0 ">
                <TableCell className="px-3 py-2 align-middle">
                  <Checkbox />
                </TableCell>

                <TableCell>
                 
                    <Link
                      to={`/player-profile/${player.id}`}
                      className="text-blue-600 underline"
                    >
                      {player.name}
                    </Link>
                  
                </TableCell>

                <TableCell className="px-3 py-2 align-middle">
                  <a
                    href="#"
                    className="text-blue-600 underline hover:text-blue-800 text-xs sm:text-sm"
                  >
                    View
                  </a>
                </TableCell>

                <TableCell className="px-3 py-2 align-middle">
                  <a
                    href="#"
                    className="text-blue-600 underline hover:text-blue-800 text-xs sm:text-sm"
                  >
                    View
                  </a>
                </TableCell>

                <TableCell className="px-3 py-2 align-middle">
                  <a
                    href="#"
                    className="text-blue-600 underline hover:text-blue-800 text-xs sm:text-sm"
                  >
                    View
                  </a>
                </TableCell>

                <TableCell className="px-3 py-2 align-middle">
                  <a
                    href="#"
                    className="text-blue-600 underline hover:text-blue-800 text-xs sm:text-sm"
                  >
                    View
                  </a>
                </TableCell>

                <TableCell className="px-3 py-2 align-middle">
                  <span
                    className={`rounded-lg px-3 py-1 text-xs font-semibold ${statusClass(
                      player.status
                    )}`}
                  >
                    {player.status}
                  </span>
                </TableCell>

                <TableCell className="px-3 py-2 align-middle">
                  <div className="flex gap-2">
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
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2 text-sm text-gray-500 dark:text-white">
        <div className="text-center sm:text-left w-full sm:w-auto">
          Showing{" "}
          {Math.min((currentPage - 1) * pageSize + 1, mediaData.length)}–
          {Math.min(currentPage * pageSize, mediaData.length)} of {mediaData.length}
        </div>

        <div className="flex flex-wrap justify-center gap-1">
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

export default Media;
