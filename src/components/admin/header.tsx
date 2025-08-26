import { AlignJustify } from "lucide-react";
import { Button } from "../ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface AdminHeaderProps {
  setOpen: (open: boolean) => void;
}

const menuItems = [
  // Admin
  { path: "/admin/dashboard", name: "Dashboard" },
  { path: "/admin/player", name: "Players" },
  { path: "/admin/expert", name: "Experts" },
  { path: "/admin/sponsor", name: "Sponsors" },
  { path: "/admin/team", name: "Teams" },
  { path: "/admin/fan", name: "Fans/Followers" },
  { path: "/admin/details-form", name: "Edit Profile" },
  { path: "/admin/playerinfo", name: "Player Profile" },

  // Player
  { path: "/player/player", name: "Players" },
 

  // Expert
  { path: "/expert/expert", name: "Experts" },
 
  //sponsors
   { path: "/sponsor/sponsor", name: "Sponsor" },

      

   //Teams
    { path: "/team/registeredteams", name: "RegisteredTeams" },

    // Fans
      { path: "/fans/fans", name: "Fans&Follwers" },
];

function Header({ setOpen }: AdminHeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  const currentTitle = (() => {
    // 1. Try exact match first
    const exactMatch = menuItems.find((item) => location.pathname === item.path);
    if (exactMatch) return exactMatch.name;

    // 2. Fallback to longest prefix match
    const prefixMatch = menuItems
      .filter((item) => location.pathname.startsWith(item.path))
      .sort((a, b) => b.path.length - a.path.length)[0];

    return prefixMatch?.name ?? "Dashboard";
  })();

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "enabled") {
      setIsDarkMode(true);
      document.body.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.body.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.body.classList.remove("dark");
      localStorage.setItem("darkMode", "disabled");
    } else {
      document.body.classList.add("dark");
      localStorage.setItem("darkMode", "enabled");
    }
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-background dark:bg-slate-950">
      {/* Left Section: Menu Button + Page Title */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => setOpen(true)}
          className="lg:hidden sm:block bg-white dark:bg-slate-700 dark:text-white text-black hover:bg-slate-100 dark:hover:bg-slate-600"
        >
          <AlignJustify />
          <span className="sr-only">Toggle Menu</span>
        </Button>

        {/* Page Title */}
        <h2 className="text-xl font-bold text-gray-800 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
          {currentTitle}
        </h2>
      </div>

      {/* Right Section: Bell & Theme Toggle */}
      <div className="flex justify-end gap-3 items-center w-full">
        <Button className="bg-white hover:bg-white dark:bg-slate-950 dark:hover:bg-slate-700 dark:text-white transition-colors p-3">
          <FontAwesomeIcon
            icon={faBell}
            className="text-black dark:text-white text-xl"
          />
        </Button>
        <Button
          onClick={toggleTheme}
          className="p-4 rounded-full dark:bg-slate-950 bg-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <FontAwesomeIcon
            icon={isDarkMode ? faMoon : faSun}
            className="text-gray-600 dark:text-white text-xl"
          />
        </Button>
      </div>
    </header>
  );
}

export default Header;
