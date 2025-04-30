import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { 
  Search, Plus, Folder, FolderPlus, Settings, ChevronRight, 
  ChevronDown, Menu, X, LogOut, Archive
} from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [folders, setFolders] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

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
  };

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 font-[Inter,system-ui,-apple-system,BlinkMacSystemFont,Segoe_UI,Roboto]">
      <style jsx>{`
        :root {
          --notes-bg: #f5f5f7;
          --sidebar-bg: #f2f2f7;
          --sidebar-hover: #e4e4e9;
          --note-bg: #ffffff;
          --text-primary: #000000;
          --text-secondary: #86868b;
          --border-color: #e0e0e5;
          --accent: #0071e3;
          --accent-light: #0077ed;
          --check-bg: #35c759;
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
      `}</style>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-3 border-b border-gray-200 bg-white">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <h1 className="text-lg font-medium">Study Notes</h1>
        <Link to={createPageUrl("NoteEdit")} className="p-2 rounded-md text-gray-500 hover:bg-gray-100">
          <Plus size={22} />
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-20 z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`w-64 border-r border-gray-200 bg-[var(--sidebar-bg)] flex-shrink-0 flex flex-col z-30 ${
            sidebarOpen ? "fixed inset-y-0 left-0 md:static" : "hidden md:flex"
          } transition-all duration-300 ease-in-out`}
        >
          <div className="p-4 flex items-center justify-between border-b border-gray-200">
            <h2 className="font-medium text-lg">Study Notes</h2>
            <button className="p-1 rounded-md text-gray-500 hover:bg-gray-100">
              <Settings size={20} />
            </button>
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
              to={createPageUrl("Notes")}
              className={`flex items-center p-2 rounded-md mb-1 ${
                currentPageName === "Notes" ? "bg-blue-100 text-blue-700" : "hover:bg-[var(--sidebar-hover)]"
              }`}
            >
              <Folder size={18} className="mr-2" />
              <span>All Notes</span>
            </Link>
            
            <Link
              to={createPageUrl("Archive")}
              className={`flex items-center p-2 rounded-md mb-1 ${
                currentPageName === "Archive" ? "bg-blue-100 text-blue-700" : "hover:bg-[var(--sidebar-hover)]"
              }`}
            >
              <Archive size={18} className="mr-2" />
              <span>Archive</span>
            </Link>

            <div className="mt-4 mb-2 px-2">
              <div className="flex items-center justify-between text-gray-500 text-sm">
                <span>FOLDERS</span>
                <Link to={createPageUrl("Folders")} className="p-1 hover:bg-[var(--sidebar-hover)] rounded">
                  <FolderPlus size={16} />
                </Link>
              </div>
            </div>

            {/* Sample folders - will be replaced with dynamic data */}
            <Link to="#" className="flex items-center p-2 rounded-md hover:bg-[var(--sidebar-hover)]">
              <span className="w-5 mr-2 text-center text-yellow-500">📚</span>
              <span>Biology</span>
            </Link>
            <Link to="#" className="flex items-center p-2 rounded-md hover:bg-[var(--sidebar-hover)]">
              <span className="w-5 mr-2 text-center text-blue-500">📊</span>
              <span>Statistics</span>
            </Link>
            <Link to="#" className="flex items-center p-2 rounded-md hover:bg-[var(--sidebar-hover)]">
              <span className="w-5 mr-2 text-center text-green-500">🧪</span>
              <span>Chemistry</span>
            </Link>
          </nav>

          <div className="p-3 border-t border-gray-200">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium">
                    {user.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </div>
                  <span className="ml-2 text-sm truncate">
                    {user.full_name || user.email}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                to="#"
                className="flex items-center justify-center p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Sign In
              </Link>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}