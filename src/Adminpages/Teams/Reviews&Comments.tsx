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
import { Trash2, Pencil, Eye, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

type Review = {
  id: number;
  teamName: string;
  clubName: string;
  status: "Pending" | "Completed";
};

const reviews: Review[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  teamName: "User name",
  clubName: "User name",
  status: i % 2 === 0 ? "Pending" : "Completed",
}));

const StatusBadge = ({ status }: { status: "Pending" | "Completed" }) => (
  <Badge
    className={cn(
      "rounded-md text-sm px-3 py-1",
      status === "Completed"
        ? "bg-green-100 text-green-700"
        : "bg-yellow-100 text-yellow-700"
    )}
  >
    {status}
  </Badge>
);

export default function TeamReviewsTable() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className=" p-5 text-xl font-semibold">Team Reviews & Comments</h2>
      </div>
      <div className="rounded-lg shadow-sm border bg-white dark:bg-gray-800 dark:border-gray-700">
        <Table>
          <TableHeader className=" bg-blue-100 dark:bg-blue-900 text-xl">
            <TableRow>
              <TableHead>
                <Checkbox />
              </TableHead>
              <TableHead>Team Names</TableHead>
              <TableHead>Club Name</TableHead>
              <TableHead>Reviews</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                {[review.teamName, review.clubName].map((name, idx) => (
                  <TableCell key={idx}>
                    <a
                      href="#"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {name}
                    </a>
                  </TableCell>
                ))}
                <TableCell>
                  <span className="text-blue-600 text-sm cursor-pointer hover:underline">
                    View
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-blue-600 text-sm cursor-pointer hover:underline">
                    View
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={review.status} />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
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
}
