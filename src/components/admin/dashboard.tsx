import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User2,
  UserCheck2,
  Users,
  UserPlus2,
  UserSquare2,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { useNavigate } from "react-router-dom";

const metrics = [
  {
    title: "Total Players",
    value: "40,689",
    icon: <User2 className="w-6 h-6 text-primary" />,
    changeColor: "text-green-500",
    bg: "bg-violet-50 dark:bg-violet-900",
  },
  {
    title: "Total Experts",
    value: "10,293",
    icon: <UserCheck2 className="w-6 h-6 text-yellow-400" />,
    changeColor: "text-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-900",
  },
  {
    title: "Total Sponsors",
    value: "9,000",
    icon: <UserPlus2 className="w-6 h-6 text-green-400" />,
    changeColor: "text-red-500",
    bg: "bg-green-50 dark:bg-green-900",
  },
  {
    title: "Total Teams",
    value: "2040",
    icon: <Users className="w-6 h-6 text-green-600" />,
    changeColor: "text-green-500",
    bg: "bg-green-50 dark:bg-green-900",
  },
  {
    title: "Total Fans & Followers",
    value: "2040",
    icon: <UserSquare2 className="w-6 h-6 text-fuchsia-400" />,
    changeColor: "text-green-500",
    bg: "bg-fuchsia-50 dark:bg-fuchsia-900",
  },
];

const categories = [
  {
    label: "Players",
    color: "bg-violet-500 hover:bg-violet-600",
    text: "text-white",
    path: "/admin/player",
  },
  {
    label: "Experts",
    color: "bg-yellow-400 hover:bg-yellow-500",
    text: "text-white",
    path: "/admin/expert",
  },
  {
    label: "Sponsors",
    color: "bg-green-500 hover:bg-green-600",
    text: "text-white",
    path: "/admin/sponsor",
  },
  {
    label: "Teams",
    color: "bg-red-400 hover:bg-red-500",
    text: "text-white",
    path: "/admin/team",
  },
  {
    label: "Fans & followers",
    color: "bg-fuchsia-500 hover:bg-fuchsia-600",
    text: "text-white",
    path: "/admin/fan",
  },
];

const chartData = Array.from({ length: 30 }, (_, i) => ({
  name: (i * 20 + 50).toString(),
  value: Math.round(Math.random() * 50 + 30 + (i % 7 === 0 ? 30 : 0)),
}));

export default function Dashboardadmin() {
  const nav = useNavigate();
  return (
    <div className="w-full max-w-full p-4 bg-[#f8faff] dark:bg-[#1f1f22] text-black dark:text-white rounded-2xl">
      {/* Top metrics cards */}
      <div className="flex gap-4 mb-4">
        {metrics.map((m, i) => (
          <Card key={i} className={`flex-1 px-3 py-2 ${m.bg} shadow-none`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground dark:text-gray-300">
                {m.title}
              </CardTitle>
              {m.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{m.value}</div>
              <div
                className={`flex items-center gap-1 text-xs mt-1 ${m.changeColor}`}
              >
                {/* You can add trending icon and % change here if needed */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Buttons */}
      <div className="flex gap-4 mb-6">
        {categories.map((cat, i) => (
          <Button
            key={i}
            className={`${cat.color} ${cat.text} flex-1 font-bold h-16 text-2xl rounded-lg shadow-none cursor-pointer`}
            onClick={() => {
              const role = cat.path.split("/")[1];
              localStorage.setItem("role", role);
              nav(cat.path);
            }}
            variant="default"
            size="lg"
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Engagement Chart */}
      <Card className="mb-4 shadow-none bg-white dark:bg-[#2c2c2f]">
        <CardHeader className="flex flex-row items-center justify-between pb-1">
          <CardTitle className="text-base font-semibold dark:text-white">
            User Engagement
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="text-xs rounded-md border-gray-200 dark:border-gray-700 dark:text-gray-200"
          >
            October
          </Button>
        </CardHeader>
        <CardContent className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 6"
                className="stroke-muted dark:stroke-gray-700"
              />
              <XAxis dataKey="name" hide />
              <YAxis hide domain={[20, 100]} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  fontSize: 13,
                }}
                labelFormatter={() => ""}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#22c55e"
                fill="url(#colorValue)"
                strokeWidth={2}
                dot={{ r: 4, stroke: "#22c55e", strokeWidth: 2, fill: "#fff" }}
                activeDot={{ r: 7 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Details */}
      <Card className="shadow-none bg-white dark:bg-[#2c2c2f]">
        <CardHeader className="flex flex-row items-center justify-between pb-1">
          <CardTitle className="text-base font-semibold dark:text-white">
            User Details
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="text-xs rounded-md border-gray-200 dark:border-gray-700 dark:text-gray-200"
          >
            October
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm dark:text-gray-400">
            No user details to display.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
