
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { 
  Search, Plus, Folder, FolderPlus, Settings, ChevronRight, 
  ChevronDown, Menu, X, LogOut, Archive, Moon, Sun, Palette
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StudyAssistantButton from "./components/aiAssistant/StudyAssistantButton";
import { routes } from "./components/utils/routing";

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [folders, setFolders] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");
  const [accentColor, setAccentColor] = useState("blue");

  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        // Try to load from server first
        const userData = await User.me();
        if (userData && userData.theme) {
          setTheme(userData.theme);
        } else {
          // Fallback to localStorage
          const storedTheme = localStorage.getItem('theme');
          if (storedTheme) setTheme(storedTheme);
        }
        
        if (userData && userData.accent_color) {
          setAccentColor(userData.accent_color);
        } else {
          // Fallback to localStorage
          const storedAccent = localStorage.getItem('accent_color');
          if (storedAccent) setAccentColor(storedAccent);
        }
      } catch (error) {
        // Fallback to localStorage if server fails
        const storedTheme = localStorage.getItem('theme');
        const storedAccent = localStorage.getItem('accent_color');
        if (storedTheme) setTheme(storedTheme);
        if (storedAccent) setAccentColor(storedAccent);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserPreferences();
  }, []);

  const updateUserPreferences = async (newTheme, newAccent) => {
    try {
      // Always save to localStorage for consistent experience
      if (newTheme) localStorage.setItem('theme', newTheme);
      if (newAccent) localStorage.setItem('accent_color', newAccent);
      
      // Try to save to server if available
      await User.updateMyUserData({
        theme: newTheme || theme,
        accent_color: newAccent || accentColor
      });
    } catch (error) {
      console.log("Saved preferences to localStorage only");
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    await updateUserPreferences(newTheme);
  };

  const changeAccentColor = async (color) => {
    setAccentColor(color);
    await updateUserPreferences(null, color);
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (error) {
        console.log("User not logged in");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, []);

  const handleLogout = async () => {
    await User.logout();
    navigate(routes.login);
  };

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className={`h-screen flex flex-col font-[Inter,system-ui,-apple-system] ${theme === "dark" ? "dark" : ""}`}>
      <style jsx>{`
        :root {
          --notes-bg: ${theme === "dark" ? "#1a1a1a" : "#f5f5f7"};
          --sidebar-bg: ${theme === "dark" ? "#242424" : "#f2f2f7"};
          --sidebar-hover: ${theme === "dark" ? "#2f2f2f" : "#e4e4e9"};
          --note-bg: ${theme === "dark" ? "#1c1c1c" : "#ffffff"};
          --text-primary: ${theme === "dark" ? "#ffffff" : "#000000"};
          --text-secondary: ${theme === "dark" ? "#a1a1a6" : "#86868b"};
          --border-color: ${theme === "dark" ? "#3a3a3c" : "#e0e0e5"};
          --accent: ${
            accentColor === "blue" ? "#0071e3" :
            accentColor === "purple" ? "#8c44dd" :
            accentColor === "green" ? "#27ae60" :
            accentColor === "pink" ? "#e84393" :
            accentColor === "orange" ? "#f39c12" : "#0071e3"
          };
          --accent-light: ${
            accentColor === "blue" ? "#0077ed" :
            accentColor === "purple" ? "#9b59b6" :
            accentColor === "green" ? "#2ecc71" :
            accentColor === "pink" ? "#fd79a8" :
            accentColor === "orange" ? "#f1c40f" : "#0077ed"
          };
          --check-bg: #35c759;
        }

        .dark {
          color-scheme: dark;
        }

        @font-face {
          font-family: 'SF Pro Display';
          src: url('https://fonts.cdnfonts.com/css/sf-pro-display') format('woff2');
          font-weight: 400, 500, 600;
          font-style: normal;
        }

        * {
          font-family: 'SF Pro Display', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        /* QuillJS theme overrides for dark mode */
        ${theme === "dark" ? `
          .ql-toolbar.ql-snow {
            border-color: var(--border-color) !important;
            background-color: var(--sidebar-bg) !important;
          }
          
          .ql-container.ql-snow {
            border-color: var(--border-color) !important;
          }

          .ql-editor {
            color: var(--text-primary) !important;
            background-color: var(--note-bg) !important;
          }
          
          .ql-editor p, .ql-editor h1, .ql-editor h2, .ql-editor li {
            color: var(--text-primary) !important;
          }
          
          .ql-snow .ql-stroke {
            stroke: var(--text-secondary) !important;
          }
          
          .ql-snow .ql-picker {
            color: var(--text-secondary) !important;
          }
        ` : ''}
      `}</style>

      {/* Mobile Header */}
      <header className={`md:hidden flex items-center justify-between p-3 border-b border-[var(--border-color)] bg-[var(--note-bg)]`}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <h1 className="text-lg font-medium text-[var(--text-primary)]">Study Notes</h1>
        <Link to={createPageUrl("NoteEdit")} className="p-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]">
          <Plus size={22} />
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-20 z-20 dark:bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`w-64 border-r border-[var(--border-color)] bg-[var(--sidebar-bg)] flex-shrink-0 flex flex-col z-30 ${
            sidebarOpen ? "fixed inset-y-0 left-0 md:static" : "hidden md:flex"
          } transition-all duration-300 ease-in-out`}
        >
          
        <div className="p-4 flex items-center justify-between border-b border-[var(--border-color)]">
          <h2 className="font-medium text-lg text-[var(--text-primary)]">Study Notes</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded-md text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]">
                  <Palette size={20} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Theme Color</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => changeAccentColor("blue")}>
                  <span className="w-4 h-4 rounded-full bg-blue-500 mr-2"></span>
                  Blue
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeAccentColor("purple")}>
                  <span className="w-4 h-4 rounded-full bg-purple-500 mr-2"></span>
                  Purple
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeAccentColor("green")}>
                  <span className="w-4 h-4 rounded-full bg-green-500 mr-2"></span>
                  Green
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeAccentColor("pink")}>
                  <span className="w-4 h-4 rounded-full bg-pink-500 mr-2"></span>
                  Pink
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeAccentColor("orange")}>
                  <span className="w-4 h-4 rounded-full bg-orange-500 mr-2"></span>
                  Orange
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

          <div className="p-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="w-full py-2 pl-9 pr-3 rounded-md bg-gray-200 text-gray-800 placeholder-gray-500 outline-none"
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-500" />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-2">
            <Link
              to={routes.notes}
              className={`flex items-center p-2 rounded-md mb-1 text-[var(--text-primary)] ${
                currentPageName === "Notes" 
                  ? "bg-[var(--accent)] bg-opacity-20 text-[var(--accent)]" 
                  : "hover:bg-[var(--sidebar-hover)]"
              }`}
            >
              <Folder size={18} className="mr-2" />
              <span>All Notes</span>
            </Link>
            
            <Link
              to={routes.archive}
              className={`flex items-center p-2 rounded-md mb-1 text-[var(--text-primary)] ${
                currentPageName === "Archive" 
                  ? "bg-[var(--accent)] bg-opacity-20 text-[var(--accent)]" 
                  : "hover:bg-[var(--sidebar-hover)]"
              }`}
            >
              <Archive size={18} className="mr-2" />
              <span>Archive</span>
            </Link>

            <div className="mt-4 mb-2 px-2">
              <div className="flex items-center justify-between text-[var(--text-secondary)] text-sm">
                <span>FOLDERS</span>
                <Link to={createPageUrl("Folders")} className="p-1 hover:bg-[var(--sidebar-hover)] rounded">
                  <FolderPlus size={16} />
                </Link>
              </div>
            </div>

            {/* Sample folders - will be replaced with dynamic data */}
            <Link to="#" className="flex items-center p-2 rounded-md hover:bg-[var(--sidebar-hover)] text-[var(--text-primary)]">
              <span className="w-5 mr-2 text-center text-yellow-500">📚</span>
              <span>Biology</span>
            </Link>
            <Link to="#" className="flex items-center p-2 rounded-md hover:bg-[var(--sidebar-hover)] text-[var(--text-primary)]">
              <span className="w-5 mr-2 text-center text-blue-500">📊</span>
              <span>Statistics</span>
            </Link>
            <Link to="#" className="flex items-center p-2 rounded-md hover:bg-[var(--sidebar-hover)] text-[var(--text-primary)]">
              <span className="w-5 mr-2 text-center text-green-500">🧪</span>
              <span>Chemistry</span>
            </Link>
          </nav>

          <div className="p-3 border-t border-[var(--border-color)]">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent)] bg-opacity-20 flex items-center justify-center text-[var(--accent)] font-medium">
                    {user.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </div>
                  <span className="ml-2 text-sm truncate text-[var(--text-primary)]">
                    {user.full_name || user.email}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-1 rounded-md text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                to={routes.login}
                className="flex items-center justify-center p-2 bg-[var(--accent)] text-white rounded-md hover:bg-[var(--accent-light)]"
              >
                Sign In
              </Link>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden bg-[var(--note-bg)]">
          {children}
        </main>
      </div>
      
      {/* AI Study Assistant */}
      <StudyAssistantButton />
    </div>
  );
}
