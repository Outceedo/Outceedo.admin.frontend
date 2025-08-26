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
import { Trash2, Eye, MoreHorizontal, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

const fanandfollowers = [
  { id: 1, name: "User name",  date: "12 Feb 2021", status: "Inactive" },
  { id: 2, name: "User name",  date: "12 Feb 2021", status: "active" },
  { id: 3, name: "User name",  date: "12 Feb 2021", status: "Inactive" },
  { id: 4, name: "User name", date: "12 Feb 2021", status: "active" },
  { id: 5, name: "User name",  date: "12 Feb 2021", status: "Inactive" },
  { id: 6, name: "User name",  date: "12 Feb 2021", status: "active" },
  { id: 7, name: "User name",  date: "12 Feb 2021", status: "Inactive" },
  { id: 8, name: "User name",  date: "12 Feb 2021", status: "active" },
  { id: 9, name: "User name",  date: "12 Feb 2021", status: "Inactive" },
  { id: 10, name: "User name",  date: "12 Feb 2021", status: "active" },
];

const statusClass = (status: string) =>
  status === "active"
    ? "bg-green-100 text-green-700"
    : "bg-yellow-100 text-yellow-700";

const Fanandfollowers = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.ceil(fanandfollowers.length / pageSize);
  const paginated = fanandfollowers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-semibold">Fans And Followers</h2>
      </div>

       <div className="rounded-lg shadow-sm border bg-white dark:bg-gray-800 dark:border-gray-700">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl ">
            <TableRow>
              <TableHead />
              <TableHead>Fans/Follower Name's</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Reviews</TableHead>
              <TableHead>Interests</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((item) => (
              <TableRow key={item.id} >
                <TableCell><Checkbox /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                   
                    <Link to={`/player-profile/${item.id}`} className="text-blue-600 underline">
                      {item.name}
                    </Link>
                  </div>
                </TableCell>
                <TableCell>{item.date}</TableCell>
                {/*comments */}
                   <TableCell>
                    <Link
                      to={"/admin/fan/comments"} // assuming each review has a unique id
                      className="text-blue-600 underline text-sm hover:text-blue-800">
                      View
                    </Link>
                  </TableCell>
                {/*reviews */}
               <TableCell>
                    <Link
                      to={"/admin/fan/reviews"} // assuming each review has a unique id
                      className="text-blue-600 underline text-sm hover:text-blue-800">
                      View
                    </Link>
                  </TableCell>
                {/*interest */}
                <TableCell>
                  <Link
                      to={"/admin/fan/interests"} // assuming each review has a unique id
                      className="text-blue-600 underline text-sm hover:text-blue-800">
                      View
                    </Link>
                  </TableCell>
                <TableCell>
                  <span className={`rounded-lg px-3 py-1 text-xs font-semibold ${statusClass(item.status)}`}>
                    {item.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    <Button size="icon" variant="ghost"><Pencil className="w-4 h-4 text-gray-600 dark:text-white" /></Button>
                    <Button size="icon" variant="ghost"><Eye className="w-4 h-4 text-gray-600 dark:text-white" /></Button>
                    <Button size="icon" variant="ghost"><MoreHorizontal className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2 text-sm text-gray-500">
        <div className="text-center sm:text-left w-full sm:w-auto">
          Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, fanandfollowers.length)} of {fanandfollowers.length}
        </div>
        <div className="flex flex-wrap justify-center gap-1">
          <button
            className="border px-2 py-1 rounded"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >⟨</button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`border px-3 py-1 rounded ${currentPage === i + 1 ? "bg-gray-300 font-semibold" : ""}`}
              onClick={() => setCurrentPage(i + 1)}
            >{i + 1}</button>
          ))}

          <button
            className="border px-2 py-1 rounded"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          >⟩</button>
        </div>
      </div>
    </div>
  );
};

export default Fanandfollowers;
