
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
import { Eye, Pencil, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Player = {
  id: number;
  playerName: string;
  teamName: string;
  clubName: string; // Assuming this as "Services Offered"
  registrationDate: string;
  enrollmentCount: number;
  status: "Active" | "Inactive";
};

const players: Player[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  playerName: "Player " + (i + 1),
  teamName: "Team " + (i + 1),
  clubName: "Service " + (i + 1),
  registrationDate: "12-06-2025",
  enrollmentCount: Math.floor(Math.random() * 30) + 1,
  status: i % 3 === 0 ? "Inactive" : "Active",
}));

const StatusBadge = ({ status }: { status: "Active" | "Inactive" }) => (
  <Badge
    className={cn(
      "rounded-md text-sm px-3 py-1",
      status === "Active"
        ? "bg-green-100 text-green-700"
        : "bg-yellow-100 text-yellow-700"
    )}
  >
    {status}
  </Badge>
);

export default function PlayerAssociations() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Player Associations</h2>
       <div className="rounded-lg shadow-sm border bg-white dark:bg-gray-800 dark:border-gray-700">
              
      <Table>
        <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl">
          <TableRow>
            <TableHead>
              
            </TableHead>
            <TableHead>Team Name</TableHead>
            <TableHead>Registration Date</TableHead>
            <TableHead>Services Offered</TableHead>
            <TableHead>Enrollments</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => (
            <TableRow key={player.id}>
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell>
                <a
    href="#"
    className="text-blue-600 underline dark:text-blue-400"
  >
    {player.teamName}
  </a>
                
                </TableCell>
              <TableCell>{player.registrationDate}</TableCell>
              <TableCell>{player.clubName}</TableCell>
              <TableCell>{player.enrollmentCount}</TableCell>
              <TableCell>
                <StatusBadge status={player.status} />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-red-100 text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
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
