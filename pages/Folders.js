import React, { useState, useEffect } from "react";
import { Folder } from "@/entities/Folder";
import { FolderPlus, Edit, Trash2, Save, X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function FoldersPage() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFolder, setEditingFolder] = useState(null);
  const [newFolder, setNewFolder] = useState({ name: "", icon: "📁" });
  const navigate = useNavigate();

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    setLoading(true);
    try {
      const foldersList = await Folder.list("order");
      setFolders(foldersList);
    } catch (error) {
      console.error("Error loading folders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolder.name.trim()) return;
    
    try {
      // Set the order to be last
      const order = folders.length > 0 
        ? Math.max(...folders.map(f => f.order || 0)) + 1 
        : 1;
      
      await Folder.create({
        ...newFolder,
        order
      });
      
      setNewFolder({ name: "", icon: "📁" });
      loadFolders();
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(createPageUrl("Notes"))}
            className="mr-2 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-medium">Manage Folders</h1>
        </div>
      </div>

      {/* Create new folder */}
      <div className="bg-white rounded-lg border mb-6 p-4">
        <h2 className="text-lg font-medium mb-4">Create New Folder</h2>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
              {newFolder.icon}
            </div>
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={newFolder.name}
              onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
              placeholder="Folder name"
              className="w-full p-2 border rounded mb-3"
            />
            <button
              onClick={handleCreateFolder}
              disabled={!newFolder.name.trim()}
              className={`flex items-center px-4 py-2 rounded ${
                newFolder.name.trim()
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              <FolderPlus size={18} className="mr-2" />
              Create Folder
            </button>
          </div>
        </div>
      </div>

      {/* Display folders list */}
      <div className="bg-white rounded-lg border">
        {loading ? (
          <div className="p-8 text-center">Loading folders...</div>
        ) : folders.length === 0 ? (
          <div className="p-8 text-center">No folders created yet.</div>
        ) : (
          <ul className="divide-y">
            {folders.map(folder => (
              <li key={folder.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{folder.icon}</span>
                  <span>{folder.name}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}