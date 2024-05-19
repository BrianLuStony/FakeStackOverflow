import {
  ChevronLast,
  ChevronFirst,
  LayoutDashboard,
} from "lucide-react";
import React, { createContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import { auth } from '../../index.js'; // Ensure this points to your firebase.js
import { signOut } from "firebase/auth";

export const SidebarContext = createContext({ expanded: true });

function SidebarHeader({ expanded, setExpanded }) {
  return (
    <div className="p-4 pb-2 flex justify-between items-center my-4">
      <div
        className={`font-bold text-3xl overflow-hidden transition-all ${
          expanded ? "w-32" : "w-0"
        }`}
      >
        FakeStackOverflow
      </div>
      <button
        onClick={() => setExpanded((curr) => !curr)}
        className="p-1.5 rounded-lg hover:bg-gray-300 bg-gray-200 dark:bg-gray-600 text-foreground"
      >
        {expanded ? <ChevronFirst /> : <ChevronLast />}
      </button>
    </div>
  );
}

function NavButtons({ expanded, isActive }) {
  const navButtons = [
    {
      path: "/",
      icon: <LayoutDashboard />,
      text: "Questions",
      active: isActive("/"),
      alert: false,
    },
    {
      path: "/tags",
      icon: <LayoutDashboard />,
      text: "Tags",
      active: isActive("/tags"),
      alert: false,
    },
  ];

  return (
    <SidebarContext.Provider value={{ expanded }}>
      <div className="px-3">
        {navButtons.map(({ path, icon, text, active, alert }) => (
          <SidebarItem
            key={text}
            path={path}
            icon={icon}
            text={text}
            active={active}
            alert={alert}
          />
        ))}
      </div>
    </SidebarContext.Provider>
  );
}

const Sidebar = () => {
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <aside className="h-screen flex flex-col justify-between">
      <nav className="h-full flex flex-col bg-card border-r shadow-sm text-lg">
        <SidebarHeader expanded={expanded} setExpanded={setExpanded} />
        <NavButtons expanded={expanded} isActive={isActive} />
        <div className="px-3 py-2">
          <button 
            className="w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
