import { cn } from "../lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";

// Hide-on-scroll, blue fixed navbar
export const Navbar = ({ children, className }) => {
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 10) {
        setShow(true);
      } else if (window.scrollY > lastScrollY) {
        setShow(false);
      } else {
        setShow(true);
      }
      setLastScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: show ? 0 : -100 }}
      transition={{ type: "tween", duration: 0.3 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-40 w-full bg-blue-700 shadow-md border-b border-blue-800",
        className
      )}
      style={{ pointerEvents: "auto" }}
    >
      {children}
    </motion.div>
  );
};

export const NavBody = ({
  children,
  className,
}) => (
  <div
    className={cn(
      "relative z-[60] mx-auto w-full max-w-7xl flex-row items-center justify-between self-start rounded-none px-4 py-3 lg:flex",
      className,
      "hidden"
    )}
  >
    {children}
  </div>
);

export const NavItems = ({ items, className, onItemClick }) => {
  const [hovered, setHovered] = useState(null);
  return (
    <div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "flex-1 flex-row items-center justify-center space-x-2 text-sm font-semibold text-white transition duration-200 lg:flex lg:space-x-2 hidden",
        className
      )}
    >
      {items.map((item, idx) => (
        <a
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          className="relative px-4 py-2 hover:text-blue-200 transition"
          key={`link-${idx}`}
          href={item.link}
        >
          <span className="relative z-20">{item.name}</span>
        </a>
      ))}
    </div>
  );
};

// Course Code Dropdown
export const CourseCodeDropdown = ({
  courseCodes,
  selectedCourse,
  onCourseChange,
  className = "",
}) => (
  <div className={cn("flex items-center space-x-2", className)}>
    <label htmlFor="courseCode" className="text-white font-semibold">
      Course Code:
    </label>
    <select
      id="courseCode"
      className="rounded px-2 py-1 bg-white text-blue-700 font-semibold focus:outline-none"
      value={selectedCourse}
      onChange={e => onCourseChange(e.target.value)}
      style={{ minWidth: 120 }}
    >
      {courseCodes.map(code => (
        <option value={code} key={code}>
          {code}
        </option>
      ))}
    </select>
  </div>
);

export const MobileNav = ({ children, className }) => (
  <div
    className={cn(
      "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-blue-700 px-3 py-2 lg:hidden shadow-md border-b border-blue-800",
      className
    )}
  >
    {children}
  </div>
);

export const MobileNavHeader = ({ children, className }) => (
  <div className={cn("flex w-full flex-row items-center justify-between", className)}>
    {children}
  </div>
);

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
  onClose,
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-lg bg-blue-700 px-4 py-8 shadow-lg border border-blue-800",
          className
        )}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

export const MobileNavToggle = ({ isOpen, onClick }) =>
  isOpen ? (
    <IconX className="text-white" onClick={onClick} />
  ) : (
    <IconMenu2 className="text-white" onClick={onClick} />
  );

export const NavbarLogo = () => (
  <a
    href="#"
    className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-white"
  >
    <img
      src="https://assets.aceternity.com/logo-dark.png"
      alt="logo"
      width={30}
      height={30}
      style={{ borderRadius: "6px" }}
    />
    <span className="font-bold text-white text-lg tracking-tight">Accredition</span>
  </a>
);

export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  ...props
}) => {
  const baseStyles =
    "px-4 py-2 rounded-md bg-white text-blue-700 text-sm font-bold relative cursor-pointer hover:bg-blue-100 transition duration-200 inline-block text-center shadow";
  return (
    <Tag
      href={href || undefined}
      className={cn(baseStyles, className)}
      {...props}
    >
      {children}
    </Tag>
  );
};
