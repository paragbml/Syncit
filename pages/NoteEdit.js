
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Note } from "@/entities/Note";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { ArrowLeft, Info, Save } from "lucide-react";
import { format } from "date-fns";

import Toolbar from "../components/editor/Toolbar";
import ResourcePanel from "../components/editor/ResourcePanel";
import ChecklistPanel from "../components/editor/ChecklistPanel";
import MindMap from "../components/editor/MindMap";

export default function NoteEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const noteId = params.get("id");
  
  const [note, setNote] = useState({
    title: "",
    content: "",
    resources: [],
    checklist: [],
    mindmap: { nodes: [], edges: [] },
    folder: "All Notes",
    is_pinned: false,
    is_archived: false
  });
  
  const [loading, setLoading] = useState(true);
  const [showMindMap, setShowMindMap] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveTimeout, setSaveTimeout] = useState(null);
  const quillRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modified, setModified] = useState(false);
  
  useEffect(() => {
    loadNote();
  }, [noteId]);

  const loadNote = async () => {
    setLoading(true);
    if (noteId) {
      try {
        const loadedNote = await Note.get(noteId);
        setNote(loadedNote);
        setShowMindMap(
          loadedNote.mindmap && 
          loadedNote.mindmap.nodes && 
          loadedNote.mindmap.nodes.length > 0
        );
      } catch (error) {
        console.error("Error loading note:", error);
      }
    }
    setLoading(false);
  };

  // Enhanced auto-save with status indicators
  useEffect(() => {
    if (loading || !modified) return;
    
    // Clear any existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    // Set a new timeout
    const timeout = setTimeout(() => {
      saveNote(true);
    }, 2000); // auto-save after 2 seconds of inactivity
    
    setSaveTimeout(timeout);
    
    // Cleanup on unmount
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [note.title, note.content, note.resources, note.checklist, note.mindmap, note.is_pinned, note.is_archived, modified]);

  // Mark as modified when content changes
  useEffect(() => {
    if (!loading) {
      setModified(true);
    }
  }, [note.title, note.content, note.resources, note.checklist, note.mindmap, note.is_pinned, note.is_archived]);

  const saveNote = async (isAutoSave = false) => {
    if (!modified) return;
    
    try {
      if (!isAutoSave) {
        setIsSaving(true);
      }
      
      // Don't save if there's nothing to save
      if (!note.title && !note.content && note.resources.length === 0 && note.checklist.length === 0) {
        return;
      }
      
      let savedNote;
      
      // Update last modified date
      const updatedNote = {
        ...note,
        last_modified: new Date().toISOString()
      };
      
      if (noteId) {
        savedNote = await Note.update(noteId, updatedNote);
      } else {
        savedNote = await Note.create(updatedNote);
        // Redirect to the edit page with the new ID
        if (!isAutoSave) {
          navigate(`/app/NoteEdit?id=${savedNote.id}`, { replace: true });
        } else {
          // Just update the URL without navigation to avoid interruption
          window.history.replaceState(null, '', `/app/NoteEdit?id=${savedNote.id}`);
        }
      }
      
      setLastSaved(new Date());
      setModified(false);
      
      return savedNote;
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      if (!isAutoSave) {
        setIsSaving(false);
      }
    }
  };

  // When leaving the page, attempt to save
  const beforeUnloadHandler = (e) => {
    if (modified) {
      e.preventDefault();
      e.returnValue = ''; // Required for Chrome
    }
  };

  useEffect(() => {
    window.addEventListener('beforeunload', beforeUnloadHandler);
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
      if (modified && !loading) {
        saveNote(true);
      }
    };
  }, [modified, loading, saveNote]);

  const handleToolbarAction = async (action) => {
    const quill = quillRef.current?.getEditor();
    
    switch (action) {
      case "bold":
        quill?.format("bold", !quill.getFormat().bold);
        break;
      case "italic":
        quill?.format("italic", !quill.getFormat().italic);
        break;
      case "underline":
        quill?.format("underline", !quill.getFormat().underline);
        break;
      case "alignLeft":
        quill?.format("align", "");
        break;
      case "alignCenter":
        quill?.format("align", "center");
        break;
      case "alignRight":
        quill?.format("align", "right");
        break;
      case "bulletList":
        const isList = quill?.getFormat().list === "bullet";
        quill?.format("list", isList ? false : "bullet");
        break;
      case "code":
        quill?.format("code-block", !quill.getFormat()["code-block"]);
        break;
      case "heading1":
        quill?.format("header", quill.getFormat().header === 1 ? false : 1);
        break;
      case "heading2":
        quill?.format("header", quill.getFormat().header === 2 ? false : 2);
        break;
      case "pin":
        setNote({
          ...note,
          is_pinned: !note.is_pinned
        });
        break;
      case "archive":
        const newArchiveState = !note.is_archived;
        setNote({
          ...note,
          is_archived: newArchiveState
        });
        
        // Immediately save and navigate back if archiving/unarchiving
        await saveNote();
        
        if (newArchiveState) {
          navigate("/app/Archive");
        } else {
          navigate("/app/Notes");
        }
        break;
      case "delete":
        if (window.confirm("Are you sure you want to delete this note?")) {
          if (noteId) {
            await Note.delete(noteId);
          }
          navigate("/app/Notes");
        }
        break;
    }
  };

  const handleInsertChecklist = () => {
    setNote({
      ...note,
      checklist: [...(note.checklist || []), { text: "New item", completed: false }]
    });
  };

  const handleInsertResource = (type) => {
    const newResource = {
      title: type === "link" ? "New Link" : "New Image",
      url: "",
      type: type
    };
    
    setNote({
      ...note,
      resources: [...(note.resources || []), newResource]
    });
  };

  const handleUpdateResources = (newResources) => {
    setNote({
      ...note,
      resources: newResources
    });
  };

  const handleUpdateChecklist = (newItems) => {
    setNote({
      ...note,
      checklist: newItems
    });
  };

  const toggleMindMap = () => {
    setShowMindMap(!showMindMap);
    
    // Initialize mind map if it's empty
    if (!showMindMap && (!note.mindmap || !note.mindmap.nodes || note.mindmap.nodes.length === 0)) {
      setNote({
        ...note,
        mindmap: {
          nodes: [{ id: "root", text: "Main Topic", x: 250, y: 100 }],
          edges: []
        }
      });
    }
  };

  const handleUpdateMindMap = (newMindMap) => {
    setNote({
      ...note,
      mindmap: newMindMap
    });
  };

  const handleCloseMindMap = () => {
    setShowMindMap(false);
  };

  const handleInsertText = (text) => {
    const quill = quillRef.current?.getEditor();
    
    if (quill) {
      // Insert text at the current cursor position
      const range = quill.getSelection();
      if (range) {
        quill.insertText(range.index, text);
      } else {
        // If no selection, append to the end of the content
        quill.insertText(quill.getLength() - 1, text);
      }
    }
  };

  //Quill modules and formats configuration
  const modules = {
    toolbar: false, // We use our custom toolbar
    clipboard: {
      matchVisual: false
    }
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "align",
    "code-block"
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--note-bg)]">
      <Toolbar 
        onAction={handleToolbarAction}
        isPinned={note.is_pinned}
        isArchived={note.is_archived}
        onInsertResource={handleInsertResource}
        onInsertChecklist={handleInsertChecklist}
        onToggleMindMap={toggleMindMap}
        noteContent={note.content}
        onInsertText={handleInsertText}
      />

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 py-2">
          {/* Collapsible panels */}
          <ResourcePanel 
            resources={note.resources || []} 
            onUpdateResources={handleUpdateResources}
            onAddResource={handleInsertResource}
          />
          
          <ChecklistPanel 
            items={note.checklist || []} 
            onUpdateItems={handleUpdateChecklist} 
          />
          
          {showMindMap && (
            <MindMap 
              initialData={note.mindmap}
              onUpdate={handleUpdateMindMap}
              onClose={handleCloseMindMap}
            />
          )}

          {/* Note Title */}
          <input
            type="text"
            value={note.title}
            onChange={(e) => setNote({ ...note, title: e.target.value })}
            placeholder="Note Title"
            className="w-full text-2xl font-medium mb-4 outline-none"
          />

          {/* Note Editor */}
          <div className="pb-20">
            <ReactQuill
              ref={quillRef}
              value={note.content}
              onChange={(content) => setNote({ ...note, content })}
              modules={modules}
              formats={formats}
              placeholder="Start writing..."
              className="h-full note-editor"
            />
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="border-t border-[var(--border-color)] py-2 px-4 text-xs text-[var(--text-secondary)] flex items-center justify-between">
        <div className="flex items-center">
          <ArrowLeft 
            size={14} 
            className="mr-1 cursor-pointer" 
            onClick={() => {
              if (modified) {
                saveNote(true).then(() => {
                  navigate(note.is_archived ? "/app/Archive" : "/app/Notes");
                });
              } else {
                navigate(note.is_archived ? "/app/Archive" : "/app/Notes");
              }
            }} 
          />
          <span>
            {isSaving ? 
              'Saving...' : 
              (lastSaved ? `Last saved: ${format(lastSaved, "h:mm a")}` : "Not saved yet")}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {modified && !isSaving && (
            <button
              onClick={() => saveNote()}
              className="flex items-center text-[var(--accent)] hover:text-[var(--accent-light)]"
            >
              <Save size={12} className="mr-1" /> Save
            </button>
          )}
          <div className="flex items-center">
            <Info size={14} className="mr-1" />
            <span>
              {note.id ? "Note ID: " + note.id.substring(0, 8) : "New note"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
