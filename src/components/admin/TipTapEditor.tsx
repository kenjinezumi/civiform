/**
 * src/components/admin/TipTapEditor.tsx
 */
import React from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface Props {
  value: string;                      // initial HTML string
  onChange: (updatedHtml: string) => void;  // called whenever user edits
}

/** 
 * A simple toolbar with bold, italic, bullet list, numbered list. 
 * You can add more commands if you like (underline, heading, etc.).
 */
function MenuBar({ editor }: { editor: Editor }) {
  if (!editor) return null;

  return (
    <div style={{ marginBottom: '0.5rem' }}>
      {/* Bold */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        style={{ 
          fontWeight: editor.isActive('bold') ? 'bold' : 'normal', 
          marginRight: '4px'
        }}
      >
        Bold
      </button>

      {/* Italic */}
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        style={{ 
          fontStyle: editor.isActive('italic') ? 'italic' : 'normal',
          marginRight: '4px'
        }}
      >
        Italic
      </button>

      {/* Bullet List */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        style={{
          textDecoration: editor.isActive('bulletList') ? 'underline' : 'none',
          marginRight: '4px'
        }}
      >
        Bullet List
      </button>

      {/* Numbered List */}
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        style={{
          textDecoration: editor.isActive('orderedList') ? 'underline' : 'none',
          marginRight: '4px'
        }}
      >
        Numbered List
      </button>
    </div>
  );
}

/**
 * A TipTap-based editor + simple toolbar. 
 * Stores HTML in `value` and returns updated HTML via `onChange`.
 */
export function TipTapEditor({ value, onChange }: Props) {
  // Create the editor with StarterKit (bold, italic, lists, etc.)
  const editor = useEditor({
    extensions: [StarterKit],
    content: value, 
    onUpdate({ editor }) {
      onChange(editor.getHTML()); // update parent with new HTML
    },
  });

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '8px', marginBottom: '1rem' }}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
