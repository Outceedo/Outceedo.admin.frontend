import { Fragment, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent } from "../ui/sheet";

import profile from "../../assets/images/avatar.png";

import outceedologo from "@/assets/images/outceedologo.png";

// --- Role-based Menu Definitions ---
interface MenuItem {
  id: number;
  name: string;
  icon: string;
  path: string;
  isLogout?: boolean;
}

export const sidebarMenus: Record<string, MenuItem[]> = {
  admin: [
    {
      id: 1,
      name: "Dashboard",
      icon: "fas fa-table-columns",
      path: "/admin/dashboard",
    },
    {
      id: 2,
      name: "Players ",
      icon: "fas fa-user-tie",
      path: "/admin/viewplayers",
    },
    { id: 3, name: "Matches", icon: "fas fa-futbol", path: "/admin/matches" },
    {
      id: 4,
      name: "My Bookings",
      icon: "fas fa-calendar-check",
      path: "/admin/mybooking",
    },
    { id: 5, name: "Calendar", icon: "fas fa-calendar", path: "/admin/slots" },
    { id: 6, name: "Profile", icon: "fas fa-user", path: "/admin/profile" },
    {
      id: 7,
      name: "Logout",
      icon: "fas fa-sign-out-alt",
      path: "/logout",
      isLogout: true,
    },
  ],
  player: [
    {
      id: 1,
      name: "Registered Players",
      icon: "fas fa-user-tie",
      path: "/admin/player",
    },
    {
      id: 2,
      name: "Booking Experts",
      icon: "fas fa-calendar-check",
      path: "/admin/player/booking",
    },
    {
      id: 3,
      name: "SponsorShip Request",
      icon: " fas fa-file-signature",
      path: "/admin/player/sponsorshipapplication",
    },
    {
      id: 4,
      name: "Services Transactions",
      icon: "fas fa-money-check-alt",
      path: "/admin/player/ServiceTransaction",
    },
    {
      id: 5,
      name: "Player's Media",
      icon: "fas fa-photo-video",
      path: "/admin/player/media",
    },

    {
      id: 6,
      name: "Dashboard",
      icon: "fas fa-chart-line",
      path: "/admin/dashboard",
    },
  ],
  expert: [
    {
      id: 1,
      name: "Registered Experts",
      icon: "fas fa-user-tie",
      path: "/admin/expert",
    },
    {
      id: 2,
      name: "Players Bookings",
      icon: "fas fa-calendar-check",
      path: "/admin/expert/booking",
    },

    {
      id: 3,
      name: "Services Offered",
      icon: "fas fa-hands-helping",
      path: "/admin/expert/services",
    },

    {
      id: 3,
      name: "Transactions/Claims",
      icon: "fas fa-money-check-alt",
      path: "/admin/expert/paymentclaims",
    },

    {
      id: 4,
      name: "Experts Media",
      icon: "fas fa-photo-video",

      path: "/admin/expert/media",
    },

    {
      id: 6,
      name: "Dashboard",
      icon: "fas fa-chart-line",
      path: "/admin/dashboard",
    },
  ],
  sponsor: [
    {
      id: 1,
      name: "Registered Sponsors",
      icon: "fas fa-user-tie",
      path: "/admin/sponsor",
    },
    {
      id: 2,
      name: "Players Request",
      icon: "fas fa-file-signature",
      path: "/admin/sponsor/playersrequest",
    },
    {
      id: 3,
      name: "Sponsorship Offered",
      icon: "fas fa-file-alt",
      path: "/admin/sponsor/sponsorshipoffered",
    },
    {
      id: 4,
      name: "Awarded Sponsorships",
      icon: "fas fa-money-check-alt",
      path: "/admin/sponsor/sponsorshiptransactions",
    },
    {
      id: 5,
      name: "Sponsors Media",
      icon: "fas fa-photo-video",
      path: "/admin/sponsor/sponsormedia",
    },

    {
      id: 6,
      name: "Dashboard",
      icon: "fas fa-chart-line",
      path: "/admin/dashboard",
    },
  ],

  team: [
    {
      id: 1,
      name: "Registered Teams",
      icon: "fas fa-users", // better for groups/teams
      path: "/admin/team",
    },

    {
      id: 2,
      name: "Registered Clubs",
      icon: "fas fa-building", // represents organizations/clubs
      path: "/admin/team/registeredclubs",
    },

    {
      id: 3,
      name: "Players Associations",
      icon: "fas fa-handshake", // suitable for associations
      path: "/admin/team/playersassociations",
    },
    {
      id: 4,
      name: "Reviews & Comments",
      icon: "fas fa-comments", // ideal for reviews/comments
      path: "/admin/team/reviews&comments",
    },
    {
      id: 5,
      name: "Activities",
      icon: "fas fa-running", // perfect for activities/sports
      path: "/admin/team/activities",
    },

    {
      id: 6,
      name: "Dashboard",
      icon: "fas fa-chart-line",
      path: "/admin/dashboard",
    },
  ],

  fan: [
    {
      id: 1,
      name: "Fans & Follwers",
      icon: "fas fa-user-tie",
      path: "/admin/fan",
    },
    {
      id: 2,
      name: "Dashboard",
      icon: "fas fa-chart-line",
      path: "/admin/dashboard",
    },
  ],
};

// --- Utility to get role from path ---

// --- MenuItems Component ---
interface MenuItemsProps {
  setOpen?: (open: boolean) => void;
  menuItems: MenuItem[];
}

function MenuItems({ setOpen, menuItems }: MenuItemsProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Fetch profile data from Redux store

  // Format name from profile data

  // Function to handle logout
  function handleLogout() {
    setShowLogoutDialog(false);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("userid");
    navigate("/login");
    window.location.reload();
  }

  // Handle menu item click
  const handleMenuItemClick = (menuItem: MenuItem) => {
    if (menuItem.isLogout) {
      setShowLogoutDialog(true);
    } else {
      navigate(menuItem.path);
      if (setOpen) setOpen(false);
    }
  };

  // Fetch profile data when component mounts

  return (
    <nav className="flex flex-col gap-6 p-4 w-full h-full overflow-y-auto">
      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogoutDialog(false)}
          ></div>
          <div className="relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-80 z-10">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Confirm Logout
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to log out of your account?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logo */}
      <div className="flex mt-1 ml-5 lg:ml-6">
        <div className="mb-8">
          <img
            src={outceedologo} // Update this path based on your project structure
            alt="Outceedo Logo"
            className="h-12 w-auto" // adjust size if needed
          />
        </div>
      </div>

      {/* Profile Section */}

      {/* Navigation Items */}
      <div className="flex flex-col gap-3 w-full px-4">
        {menuItems.map((menuItem) => {
          const isActive =
            !menuItem.isLogout && location.pathname === menuItem.path;
          return (
            <div
              key={menuItem.id}
              onClick={() => handleMenuItemClick(menuItem)}
              className={`flex items-center gap-3 px-3 py-2 text-md cursor-pointer rounded-md transition-colors
                ${
                  isActive
                    ? "bg-gray-100 text-black font-medium dark:bg-gray-700 dark:text-white"
                    : menuItem.isLogout
                    ? "text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }
              `}
            >
              <i
                className={`${menuItem.icon} ${
                  isActive
                    ? "text-gray-800 dark:text-white"
                    : menuItem.isLogout
                    ? "text-red-500 dark:text-red-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              ></i>
              <span className={isActive ? "font-medium" : ""}>
                {menuItem.name}
              </span>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

// --- Main Sidebar Component ---
interface AdminSideBarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  role: string;
}

function AdminSideBar({ open, setOpen, role }: AdminSideBarProps) {
  // const location = useLocation();
  //const role = getRoleFromPath(location.pathname);
  const menuItems = sidebarMenus[role] || sidebarMenus.admin;
  return (
    <Fragment>
      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-56 p-0 overflow-y-auto">
          <div className="flex flex-col h-full">
            <MenuItems setOpen={setOpen} menuItems={menuItems} />
          </div>
        </SheetContent>
      </Sheet>
      {/* Desktop sidebar - fixed position */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-64 flex-col border-r bg-background dark:bg-slate-950 z-40">
        <MenuItems menuItems={menuItems} />
      </aside>
      {/* Spacer */}
      <div className="hidden lg:block w-64 flex-shrink-0"></div>
    </Fragment>
  );
}

export default AdminSideBar;
