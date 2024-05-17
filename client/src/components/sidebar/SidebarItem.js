import React, { useContext } from "react";
import { SidebarContext } from "./Sidebar";
import { NavLink } from "react-router-dom";

function HoverTag({ text }) {
  return (
    <div
      className={`
            absolute left-full rounded-md px-2 py-1 ml-6
            bg-indigo-200 text-indigo-800 text-sm z-50
            invisible opacity-20 -translate-x-3 transition-all
            group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
        `}
    >
      {text}
    </div>
  );
}

function NavButtonContent({ icon, text, textStyle }) {
  return (
    <>
      {icon}
      <span className={textStyle}>{text}</span>
    </>
  );
}

const SidebarItem = ({ path, icon, text, active, alert }) => {
  const { expanded } = useContext(SidebarContext);
  return (
    <NavLink to={path}>
      <div
        className={`
          relative flex items-center p-2 mb-4
          font-medium rounded-md cursor-pointer
          transition-colors group justify-center
          duration-400
          ${
            active
              ? "bg-indigo-50"
              : "hover:bg-indigo-50 text-gray-600"
          }
      `}
      >
        <NavButtonContent
          icon={icon}
          text={text}
          textStyle={`overflow-hidden transition-all ${
            expanded ? "w-36 ml-3" : "w-0"
          }`}
        />
        {!expanded && <HoverTag text={text} />}
      </div>
    </NavLink>
  );
};

export default SidebarItem;
