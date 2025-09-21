import React, { useState, useEffect } from 'react';
import './App.css'


const App = () => {
  // Load initial data from localStorage or use defaults
  const loadFromStorage = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (key === 'learningNotes') {
          return parsed.map(note => ({
            ...note,
            createdAt: new Date(note.createdAt)
          }));
        }
        return parsed;
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
    }
    return defaultValue;
  };

  const [darkMode, setDarkMode] = useState(() => loadFromStorage('darkMode', false));
  const [categories, setCategories] = useState(() =>
    loadFromStorage('learningCategories', [
      { id: 1, name: 'JavaScript', color: 'from-yellow-400 to-orange-500' },
      { id: 2, name: 'PHP', color: 'from-blue-400 to-cyan-500' },
      { id: 3, name: 'Python', color: 'from-green-400 to-emerald-500' }
    ])
  );
  const [notes, setNotes] = useState(() =>
    loadFromStorage('learningNotes', [
      {
        id: 1,
        title: 'Arrow Functions',
        categoryId: 1,
        content: 'Arrow functions are a shorter way to write functions in JavaScript.\n\n```javascript\nconst add = (a, b) => a + b;\nconsole.log(add(2, 3)); // Output: 5\n```\n\nThey have **lexical this binding** and *cannot* be used as constructors.',
        pinned: false,
        createdAt: new Date('2024-01-15')
      },
      {
        id: 2,
        title: 'useState Hook',
        categoryId: 2,
        content: 'useState is a Hook that allows you to add state to functional components.\n\n```javascript\nconst [count, setCount] = useState(0);\n\nreturn (\n  <button onClick={() => setCount(count + 1)}>\n    Count: {count}\n  </button>\n);\n```\n\nAlways use the **setter function** to update state for *proper re-rendering*.',
        pinned: true,
        createdAt: new Date('2024-01-16')
      }
    ])
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteForm, setNoteForm] = useState({ title: '', categoryId: '', content: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '', color: 'from-blue-400 to-cyan-500' });
  const [draft, setDraft] = useState('');
  const [readMode, setReadMode] = useState(null);
  const [fontSize, setFontSize] = useState('medium');
  const [fontFamily, setFontFamily] = useState('sans');
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [flippedCard, setFlippedCard] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [showDeleteNoteModal, setShowDeleteNoteModal] = useState(false);

  const gradientColors = [
    'from-blue-400 to-cyan-500',
    'from-purple-400 to-pink-500',
    'from-green-400 to-emerald-500',
    'from-yellow-400 to-orange-500',
    'from-red-400 to-rose-500',
    'from-indigo-400 to-blue-500'
  ];

  // Save to localStorage
  useEffect(() => localStorage.setItem('darkMode', JSON.stringify(darkMode)), [darkMode]);
  useEffect(() => localStorage.setItem('learningCategories', JSON.stringify(categories)), [categories]);
  useEffect(() => localStorage.setItem('learningNotes', JSON.stringify(notes)), [notes]);
  useEffect(() => localStorage.setItem('noteDraft', draft), [draft]);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('noteDraft');
    if (savedDraft) setDraft(savedDraft);
  }, []);

  // Filter and search notes
  const filteredNotes = notes
    .filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(note.categoryId);
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => b.pinned - a.pinned || new Date(b.createdAt) - new Date(a.createdAt));

  const getCategoryById = (id) => categories.find(cat => cat.id === id);

  const toggleCategory = (id) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const togglePin = (noteId) => {
    setNotes(prev => prev.map(note =>
      note.id === noteId ? { ...note, pinned: !note.pinned } : note
    ));
  };

  const handleSaveNote = () => {
    if (noteForm.title && noteForm.categoryId) {
      if (editingNote) {
        setNotes(prev => prev.map(note =>
          note.id === editingNote.id
            ? { ...note, ...noteForm, categoryId: parseInt(noteForm.categoryId) }
            : note
        ));
      } else {
        setNotes(prev => [...prev, {
          id: Date.now(),
          ...noteForm,
          categoryId: parseInt(noteForm.categoryId),
          pinned: false,
          createdAt: new Date()
        }]);
      }
      setShowNoteModal(false);
      setEditingNote(null);
      setNoteForm({ title: '', categoryId: '', content: '' });
      setDraft('');
    }
  };

  const handleSaveCategory = () => {
    if (categoryForm.name) {
      setCategories(prev => [...prev, {
        id: Date.now(),
        ...categoryForm
      }]);
      setShowCategoryModal(false);
      setCategoryForm({ name: '', color: 'from-blue-400 to-cyan-500' });
    }
  };


  const exportToPDF = (singleNote = null) => {
    const printWindow = window.open('', '_blank');

    let notesToExport = [];
    let title = "My Learning Notes";

    if (singleNote) {
      notesToExport = [singleNote];
      title = singleNote.title;
    } else {
      const categorizedNotes = categories.map(category => ({
        ...category,
        notes: notes.filter(note => note.categoryId === category.id)
      })).filter(cat => cat.notes.length > 0);
      notesToExport = categorizedNotes;
    }

    const formatContentForPDF = (content) => {
      return content.split(/```(\w+)?\n([\s\S]*?)\n```/g).map((part, index) => {
        if (index % 3 === 0) {
          let processedContent = part
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^## (.*)/gm, '<h2 style="font-size: 20px; font-weight: bold; margin: 16px 0 8px;">$1</h2>')
            .replace(/^> (.*)/gm, '<blockquote style="border-left: 4px solid #3b82f6; padding-left: 12px; margin: 8px 0; color: #4b5563;">$1</blockquote>')
            .replace(/^- (.*)/gm, '<li style="margin-left: 20px;">• $1</li>');
          return processedContent.split('\n').map(line =>
            line.trim() && !line.match(/^(<strong>|<em>|<h2>|<blockquote>|<li>)/) ? `<p style="margin-bottom: 8px; line-height: 1.6;">${line}</p>` : line
          ).join('');
        } else if (index % 3 === 2) {
          return `<pre style="background: #1f2937; color: #10b981; padding: 16px; border-radius: 8px; margin: 16px 0; font-family: 'Courier New', monospace; font-size: 14px; overflow-x: auto; border-left: 4px solid #3b82f6;"><code>${part}</code></pre>`;
        }
        return '';
      }).join('');
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          @page { margin: 2cm; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; line-height: 1.6; color: #333; }
          .cover { text-align: center; padding: 50px 0; ${singleNote ? '' : 'page-break-after: always;'} }
          .cover h1 { font-size: ${singleNote ? '36px' : '48px'}; color: #4f46e5; margin-bottom: 16px; }
          .cover p { font-size: 18px; color: #6b7280; margin-bottom: 32px; }
          .stats { background: #f8fafc; padding: 20px; border-radius: 12px; display: inline-block; }
          .category-section { margin-bottom: 40px; }
          .category-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 24px; }
          .note-card { background: white; border: 2px solid #e5e7eb; border-radius: 16px; padding: 24px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .note-title { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 12px; }
          .note-meta { font-size: 14px; color: #6b7280; margin-bottom: 16px; background: #f9fafb; padding: 12px; border-radius: 8px; }
          .note-content p { margin-bottom: 12px; }
          pre { background: #1f2937 !important; color: #10b981 !important; }
          .footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 40px; }
        </style>
      </head>
      <body>
        <div class="cover">
          <h1>📚 ${title}</h1>
          ${singleNote ? `
            <div class="stats">
              <div style="margin-bottom: 8px;"><strong>Category:</strong> ${getCategoryById(singleNote.categoryId)?.name}</div>
              <div style="margin-bottom: 8px;"><strong>Created:</strong> ${singleNote.createdAt.toLocaleDateString('id-ID')}</div>
              <div><strong>Length:</strong> ${singleNote.content.length} characters</div>
            </div>
          ` : `
            <p>Personal Knowledge Base</p>
            <div class="stats">
              <div style="margin-bottom: 12px;"><strong>${notes.length}</strong> Total Notes</div>
              <div style="margin-bottom: 12px;"><strong>${categories.length}</strong> Categories</div>
              <div><strong>${new Date().toLocaleDateString('id-ID')}</strong></div>
            </div>
          `}
        </div>

        ${singleNote ? `
          <div class="note-card">
            <div class="note-title">${singleNote.title} ${singleNote.pinned ? '📌' : ''}</div>
            <div class="note-meta">
              <strong>Category:</strong> ${getCategoryById(singleNote.categoryId)?.name} | 
              <strong>Created:</strong> ${singleNote.createdAt.toLocaleDateString('id-ID')} | 
              <strong>Length:</strong> ${singleNote.content.length} characters
            </div>
            <div class="note-content">
              ${formatContentForPDF(singleNote.content)}
            </div>
          </div>
        ` : notesToExport.map(category => `
          <div class="category-section">
            <div class="category-header">
              <h2 style="margin: 0; font-size: 24px;">📂 ${category.name}</h2>
              <p style="margin: 8px 0 0; opacity: 0.9;">${category.notes.length} notes in this category</p>
            </div>
            
            ${category.notes.map(note => `
              <div class="note-card">
                <div class="note-title">${note.title} ${note.pinned ? '📌' : ''}</div>
                <div class="note-meta">Created: ${note.createdAt.toLocaleDateString('id-ID')} • ${note.content.length} characters</div>
                <div class="note-content">
                  ${formatContentForPDF(note.content)}
                </div>
              </div>
            `).join('')}
          </div>
        `).join('')}

        <div class="footer">
          <p>Generated from Learning Notes App • ${new Date().toLocaleString('id-ID')}</p>
          <p>Keep learning and growing! 🌱</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const openReadMode = (note) => {
    setReadMode(note);
    document.body.style.overflow = 'hidden';
  };

  const closeReadMode = () => {
    setReadMode(null);
    document.body.style.overflow = 'auto';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      const button = event.target;
      const originalText = button.textContent;
      button.textContent = '✅ Copied!';
      button.className = button.className.replace('hover:bg-gray-600', 'bg-green-600');
      setTimeout(() => {
        button.textContent = originalText;
        button.className = button.className.replace('bg-green-600', 'hover:bg-gray-600');
      }, 2000);
    });
  };

  const insertFormatting = (format) => {
    const textarea = document.querySelector('#noteContentTextarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = noteForm.content.substring(start, end);
    const textBefore = noteForm.content.substring(0, start);
    const textAfter = noteForm.content.substring(end);

    let newText = '';
    switch (format) {
      case 'bold':
        newText = selectedText ? `**${selectedText}**` : '**bold text**';
        break;
      case 'italic':
        newText = selectedText ? `*${selectedText}*` : '*italic text*';
        break;
      case 'heading':
        newText = selectedText ? `## ${selectedText}` : '## Heading';
        break;
      case 'quote':
        newText = selectedText ? `> ${selectedText}` : '> Quote text';
        break;
      case 'list':
        newText = selectedText ? `- ${selectedText}` : '- List item';
        break;
      default:
        return;
    }

    const newContent = textBefore + newText + textAfter;
    setNoteForm({ ...noteForm, content: newContent });
    setDraft(newContent);

    setTimeout(() => {
      textarea.focus();
      const newStart = start + (selectedText ? newText.length : newText.indexOf(selectedText || 'text'));
      textarea.setSelectionRange(newStart, newStart);
    }, 0);
  };

  const openNoteModal = (note = null) => {
    if (note) {
      setEditingNote(note);
      setNoteForm({ title: note.title, categoryId: note.categoryId.toString(), content: note.content });
    } else {
      setEditingNote(null);
      setNoteForm({ title: '', categoryId: '', content: draft });
    }
    setShowNoteModal(true);
  };

  // Function untuk handle delete category
  const handleDeleteCategory = (categoryId) => {
    console.log('Delete category called with ID:', categoryId); // Debug log

    // Cek apakah ada notes yang menggunakan category ini
    const notesInCategory = notes.filter(note => note.categoryId === categoryId);
    console.log('Notes in category:', notesInCategory.length); // Debug log

    if (notesInCategory.length > 0) {
      // Jika ada notes, tampilkan modal konfirmasi
      console.log('Showing delete modal'); // Debug log
      setCategoryToDelete(categoryId);
      setShowDeleteCategoryModal(true);
    } else {
      // Jika tidak ada notes, langsung hapus
      console.log('Deleting category directly'); // Debug log
      deleteCategory(categoryId);
    }
  };


  // Function untuk delete category
  const deleteCategory = (categoryId) => {
    // Hapus category
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));

    // Pindahkan notes yang menggunakan category ini ke "Uncategorized" atau hapus categoryId
    setNotes(prev => prev.map(note =>
      note.categoryId === categoryId
        ? { ...note, categoryId: null }
        : note
    ));

    // Reset selected categories filter jika category yang dihapus sedang dipilih
    setSelectedCategories(prev => prev.filter(id => id !== categoryId));

    // Close modal
    setShowDeleteCategoryModal(false);
    setCategoryToDelete(null);
  };

  const handleDeleteNote = (noteId) => {
    const noteToDelete = notes.find(note => note.id === noteId);
    setNoteToDelete(noteToDelete);
    setShowDeleteNoteModal(true);
  };

  const deleteNote = (noteId) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    setShowDeleteNoteModal(false);
    setNoteToDelete(null);
  };

  const renderContent = (content) => {
    return content.split(/```(\w+)?\n([\s\S]*?)\n```/g).map((part, index) => {
      if (index % 3 === 0) {
        return (
          <div key={index} className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {part.split('\n').map((line, lineIndex) => {
              if (!line.trim()) return <br key={lineIndex} />;

              let processedLine = line
                .replace(/\*\*(.*?)\*\*/g, `<strong>$1</strong>`)
                .replace(/\*(.*?)\*/g, `<em>$1</em>`)
                .replace(/^## (.*)/g, `<h2 class="text-xl font-bold mb-2 mt-4 ${darkMode ? 'text-white' : 'text-gray-900'}">$1</h2>`)
                .replace(/^> (.*)/g, `<blockquote class="border-l-4 border-blue-500 pl-4 italic ${darkMode ? 'text-gray-400' : 'text-gray-600'} my-2">$1</blockquote>`)
                .replace(/^- (.*)/g, `<li class="ml-4">• $1</li>`);

              return (
                <p key={lineIndex} className="mb-2" dangerouslySetInnerHTML={{ __html: processedLine }} />
              );
            })}
          </div>
        );
      } else if (index % 3 === 2) {
        return (
          <pre key={index} className={`p-4 rounded-lg mb-4 overflow-x-auto text-sm ${darkMode ? 'bg-gray-900 text-green-400 border border-gray-700' : 'bg-gray-100 text-gray-800 border'}`}>
            <code>{part}</code>
          </pre>
        );
      }
      return null;
    });
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white'
      : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-900'
      }`}>
      {/* Floating particles background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full animate-pulse ${darkMode ? 'bg-blue-400' : 'bg-indigo-300'}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>


      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-4 mb-4">
            <div className="text-6xl animate-bounce">🧠</div>
            <h1 className={`text-5xl font-bold bg-gradient-to-r ${darkMode ? 'from-blue-400 to-purple-400' : 'from-purple-600 to-blue-600'} bg-clip-text text-transparent`}>
              Learning Notes
            </h1>
          </div>
          <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
            Capture, organize, and master your knowledge ✨
          </p>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${darkMode
              ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 shadow-lg shadow-yellow-400/25'
              : 'bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow-lg shadow-gray-500/25'
              }`}
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="🔍 Search your notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-6 py-4 rounded-2xl border-2 transition-all duration-300 text-lg ${darkMode
                ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-400 focus:bg-gray-750'
                : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:bg-blue-50'
                } shadow-lg focus:shadow-xl`}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(category => (
              <div key={category.id} className="relative group">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={`px-4 py-2 pr-8 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${selectedCategories.includes(category.id)
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                    : darkMode
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-md'
                    }`}
                >
                  <span className={`inline-block w-2 h-2 rounded-full bg-gradient-to-r ${category.color} mr-2`} />
                  {category.name} ({notes.filter(n => n.categoryId === category.id).length})
                </button>

                {/* Delete button - PERBAIKAN */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Delete button clicked for category:', category.id); // Debug
                    handleDeleteCategory(category.id);
                  }}
                  className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 z-10 ${darkMode
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg'
                    : 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                    }`}
                  title="Hapus kategori"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => setShowCategoryModal(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border-2 border-dashed hover:scale-105 ${darkMode
                ? 'border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300'
                : 'border-gray-400 hover:border-gray-600 text-gray-600 hover:text-gray-800'
                }`}
            >
              ➕ Add Category
            </button>
          </div>
        </div>
        {/* Delete Category Confirmation Modal */}
        {showDeleteCategoryModal && categoryToDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`rounded-3xl p-8 max-w-md w-full transform transition-all duration-300 scale-100 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-2xl`}>

              {/* Warning Icon */}
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Hapus Kategori?
                </h3>
              </div>

              {/* Content */}
              <div className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {(() => {
                  const categoryName = categories.find(cat => cat.id === categoryToDelete)?.name;
                  const notesCount = notes.filter(note => note.categoryId === categoryToDelete).length;

                  return (
                    <div className="space-y-4">
                      <p className="text-center">
                        Anda yakin ingin menghapus kategori <strong>"{categoryName}"</strong>?
                      </p>

                      {notesCount > 0 && (
                        <div className={`p-4 rounded-xl ${darkMode ? 'bg-yellow-600/20 border border-yellow-600/30' : 'bg-yellow-50 border border-yellow-200'}`}>
                          <p className={`text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                            📋 Terdapat <strong>{notesCount} catatan</strong> dalam kategori ini
                          </p>
                          <p className={`text-xs mt-2 ${darkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
                            Catatan-catatan tersebut akan dipindah ke status "Tanpa Kategori"
                          </p>
                        </div>
                      )}

                      <p className={`text-sm text-center ${darkMode ? 'text-red-400' : 'text-red-600'} font-medium`}>
                        Tindakan ini tidak dapat dibatalkan!
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => deleteCategory(categoryToDelete)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
                >
                  🗑️ Ya, Hapus Kategori
                </button>
                <button
                  onClick={() => {
                    setShowDeleteCategoryModal(false);
                    setCategoryToDelete(null);
                  }}
                  className={`flex-1 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
        {showDeleteNoteModal && noteToDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`rounded-3xl p-8 max-w-md w-full transform transition-all duration-300 scale-100 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-2xl`}>

              {/* Warning Icon */}
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🗑️</div>
                <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Hapus Catatan?
                </h3>
              </div>

              {/* Content */}
              <div className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <div className="space-y-4">
                  <p className="text-center">
                    Anda yakin ingin menghapus catatan <strong>"{noteToDelete.title}"</strong>?
                  </p>

                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-yellow-600/20 border border-yellow-600/30' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <p className={`text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                      📋 Detail Catatan:
                    </p>
                    <ul className={`text-xs mt-2 space-y-1 ${darkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
                      <li>• Kategori: {getCategoryById(noteToDelete.categoryId)?.name || 'Tanpa Kategori'}</li>
                      <li>• Dibuat: {noteToDelete.createdAt.toLocaleDateString('id-ID')}</li>
                      <li>• Panjang: {noteToDelete.content.length} karakter</li>
                      {noteToDelete.pinned && <li>• Status: Catatan yang di-pin</li>}
                    </ul>
                  </div>

                  <p className={`text-sm text-center ${darkMode ? 'text-red-400' : 'text-red-600'} font-medium`}>
                    Tindakan ini tidak dapat dibatalkan!
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => deleteNote(noteToDelete.id)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
                >
                  🗑️ Ya, Hapus Catatan
                </button>
                <button
                  onClick={() => {
                    setShowDeleteNoteModal(false);
                    setNoteToDelete(null);
                  }}
                  className={`flex-1 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
          <div className={`p-4 rounded-2xl backdrop-blur-sm ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white/60 border border-white/20'} shadow-xl`}>
            <div className="text-center">
              <div className="text-2xl font-bold">{notes.length}</div>
              <div className="text-sm opacity-75">Total Notes</div>
            </div>
          </div>
          <div className={`p-4 rounded-2xl backdrop-blur-sm ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white/60 border border-white/20'} shadow-xl`}>
            <div className="text-center">
              <div className="text-2xl font-bold">{notes.filter(n => n.pinned).length}</div>
              <div className="text-sm opacity-75">Pinned</div>
            </div>
          </div>
          <div className={`p-4 rounded-2xl backdrop-blur-sm ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white/60 border border-white/20'} shadow-xl`}>
            <div className="text-center">
              <div className="text-2xl font-bold">{categories.length}</div>
              <div className="text-sm opacity-75">Categories</div>
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNotes.map(note => {
            const category = getCategoryById(note.categoryId);
            return (
              <div
                key={note.id}
                className="group relative transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
                style={{
                  perspective: '1000px',
                  height: '320px', // Fixed height to prevent layout shift
                  minHeight: '320px'
                }}
              >
                {/* The actual flipping card container */}
                <div
                  className={`relative w-full h-full transition-all duration-700 ${flippedCard === note.id ? 'rotate-y-180' : ''}`}
                  style={{
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {/* Front Side of Card */}
                  <div
                    className={`absolute inset-0 w-full h-full rounded-3xl p-6 ${darkMode
                      ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-2xl'
                      : 'bg-white border border-gray-200 shadow-xl'
                      } backdrop-blur-sm`}
                    style={{
                      backfaceVisibility: 'hidden'
                    }}
                  >
                    {note.pinned && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        📌
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-4">
                      <h3 className={`text-lg font-bold flex-1 pr-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: '1.3'
                        }}>
                        {note.title}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFlippedCard(flippedCard === note.id ? null : note.id);
                        }}
                        className={`p-2 rounded-lg transition-all duration-300 ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} opacity-0 group-hover:opacity-100 hover:scale-110 flex-shrink-0`}
                        title="More actions"
                      >
                        <div className={`transform transition-transform duration-300 ${flippedCard === note.id ? 'rotate-180' : ''}`}>
                          ⋮
                        </div>
                      </button>
                    </div>

                    {category && (
                      <div className="mb-3">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${category.color} text-white shadow-md`}>
                          <span className="w-2 h-2 bg-white rounded-full opacity-80" />
                          <span className="truncate">{category.name}</span>
                        </span>
                      </div>
                    )}

                    <div className="mb-4 flex-1 overflow-hidden" style={{ maxHeight: '100px' }}>
                      <div className="text-sm leading-relaxed overflow-hidden"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: 'vertical'
                        }}>
                        {renderContent(note.content.substring(0, 120) + (note.content.length > 120 ? '...' : ''))}
                      </div>
                    </div>

                    {/* Quick Action Buttons - Edit and Delete */}
                    <div className="flex gap-2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => openNoteModal(note)}
                        className={`flex-1 px-3 py-2 text-xs rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${darkMode
                          ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-600/30'
                          : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                          }`}
                      >
                        <span>✏️</span>
                        <span className="font-medium">Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className={`flex-1 px-3 py-2 text-xs rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${darkMode
                          ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30'
                          : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                          }`}
                      >
                        <span>🗑️</span>
                        <span className="font-medium">Delete</span>
                      </button>
                    </div>

                    <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} flex justify-between items-center mt-auto`}>
                      <span className="truncate pr-2">{note.createdAt.toLocaleDateString('id-ID')}</span>
                      <span className="flex-shrink-0">{note.content.length} chars</span>
                    </div>
                  </div>

                  {/* Back Side of Card - More Actions */}
                  <div
                    className={`absolute inset-0 w-full h-full rounded-3xl p-6 ${darkMode
                      ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-2xl'
                      : 'bg-gradient-to-br from-indigo-50 to-blue-50 border border-gray-200 shadow-xl'
                      } backdrop-blur-sm`}
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}
                  >
                    <div className="h-full flex flex-col">
                      {/* Header */}
                      <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <h4 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          More Actions
                        </h4>
                        <button
                          onClick={() => setFlippedCard(null)}
                          className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
                        >
                          ✕
                        </button>
                      </div>

                      {/* Additional Action Buttons */}
                      <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100% - 60px)' }}>
                        <button
                          onClick={() => { openReadMode(note); setFlippedCard(null); }}
                          className={`w-full px-4 py-3 text-sm rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 ${darkMode
                            ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-600/30'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
                            }`}
                        >
                          <span className="text-lg">👁️</span>
                          <span className="font-medium">Read Mode</span>
                        </button>

                        <button
                          onClick={() => { togglePin(note.id); setFlippedCard(null); }}
                          className={`w-full px-4 py-3 text-sm rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 ${note.pinned
                            ? darkMode
                              ? 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30 border border-yellow-600/30'
                              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300'
                            : darkMode
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                            }`}
                        >
                          <span className="text-lg">📌</span>
                          <span className="font-medium">{note.pinned ? 'Unpin Note' : 'Pin Note'}</span>
                        </button>

                        <button
                          onClick={() => { exportToPDF(note); setFlippedCard(null); }}
                          className={`w-full px-4 py-3 text-sm rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 ${darkMode
                            ? 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-600/30'
                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300'
                            }`}
                        >
                          <span className="text-lg">📄</span>
                          <span className="font-medium">Export as PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Note Button */}
          <div
            onClick={() => openNoteModal()}
            className={`group cursor-pointer rounded-lg p-8 border-3 border-dashed transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 flex flex-col items-center justify-center min-h-[320px] ${darkMode
              ? 'border-gray-600 hover:border-blue-400 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:bg-gradient-to-br hover:from-blue-900/20 hover:to-purple-900/20'
              : 'border-gray-300 hover:border-blue-500 bg-gradient-to-br from-gray-50 to-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50'
              } backdrop-blur-sm shadow-xl hover:shadow-2xl`}
          >
            <div className={`text-6xl mb-4 transition-transform group-hover:scale-110 ${darkMode ? 'text-blue-400' : 'text-indigo-500'}`}>
              ➕
            </div>
            <p className={`text-xl font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Create New Note
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} text-center`}>
              Capture your next learning moment
            </p>
          </div>
        </div>
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-all duration-300 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-2xl`}>
            <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {editingNote ? '✏️ Edit Note' : '✨ Create New Note'}
            </h2>

            <div className="space-y-6">
              <input
                type="text"
                required
                placeholder="Enter your note title..."
                value={noteForm.title}
                onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                className={`w-full px-6 py-4 rounded-2xl border-2 transition-all text-xl font-medium ${darkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400'
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
                  }`}
              />

              <select
                value={noteForm.categoryId}
                required
                onChange={(e) => setNoteForm({ ...noteForm, categoryId: e.target.value })}
                className={`w-full px-6 py-4 rounded-2xl border-2 transition-all ${darkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400'
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
                  }`}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Content
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const textarea = document.querySelector('#noteContentTextarea');
                        const cursorPos = textarea.selectionStart;
                        const textBefore = noteForm.content.substring(0, cursorPos);
                        const textAfter = noteForm.content.substring(cursorPos);
                        const newContent = textBefore + '\n\n```javascript\n// Your code here\n```\n' + textAfter;
                        setNoteForm({ ...noteForm, content: newContent });
                        setTimeout(() => {
                          textarea.focus();
                          textarea.setSelectionRange(cursorPos + 15, cursorPos + 31);
                        }, 0);
                      }}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                    >
                      💻 Insert Code Block
                    </button>
                    <button
                      onClick={() => setIsCodeMode(!isCodeMode)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${isCodeMode
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                      {isCodeMode ? '📝 Edit Mode' : '👀 Preview Mode'}
                    </button>
                  </div>
                </div>

                {/* Formatting Toolbar */}
                {!isCodeMode && (
                  <div className={`p-3 rounded-xl border flex flex-wrap gap-2 ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300'}`}>
                    <button
                      onClick={() => insertFormatting('bold')}
                      className={`px-3 py-1 text-sm font-bold rounded hover:bg-opacity-80 transition-colors ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-200'}`}
                      title="Bold (Ctrl+B)"
                    >
                      B
                    </button>
                    <button
                      onClick={() => insertFormatting('italic')}
                      className={`px-3 py-1 text-sm italic rounded hover:bg-opacity-80 transition-colors ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-200'}`}
                      title="Italic (Ctrl+I)"
                    >
                      I
                    </button>
                    <div className={`w-px h-6 ${darkMode ? 'bg-gray-600' : 'bg-gray-400'}`}></div>
                    <button
                      onClick={() => insertFormatting('heading')}
                      className={`px-3 py-1 text-sm rounded hover:bg-opacity-80 transition-colors ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-200'}`}
                      title="Heading"
                    >
                      H
                    </button>
                    <button
                      onClick={() => insertFormatting('quote')}
                      className={`px-3 py-1 text-sm rounded hover:bg-opacity-80 transition-colors ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-200'}`}
                      title="Quote"
                    >
                      " "
                    </button>
                    <button
                      onClick={() => insertFormatting('list')}
                      className={`px-3 py-1 text-sm rounded hover:bg-opacity-80 transition-colors ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-200'}`}
                      title="List"
                    >
                      •
                    </button>
                    <div className={`w-px h-6 ${darkMode ? 'bg-gray-600' : 'bg-gray-400'}`}></div>
                    <select
                      onChange={(e) => {
                        const textarea = document.querySelector('#noteContentTextarea');
                        textarea.style.fontSize = e.target.value;
                      }}
                      className={`px-2 py-1 text-xs rounded ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'} border`}
                      defaultValue="14px"
                    >
                      <option value="12px">Small</option>
                      <option value="14px">Normal</option>
                      <option value="16px">Large</option>
                      <option value="18px">Extra Large</option>
                    </select>
                  </div>
                )}

                <div className={`relative rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  {!isCodeMode ? (
                    <textarea
                      id="noteContentTextarea"
                      placeholder="Write your notes here... Use ```javascript for code blocks, **bold**, *italic*, ## headings!"
                      value={noteForm.content}
                      onChange={(e) => {
                        setNoteForm({ ...noteForm, content: e.target.value });
                        setDraft(e.target.value);
                      }}
                      className={`w-full px-6 py-4 border-2 rounded-2xl transition-all resize-none h-96 ${darkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
                        } focus:outline-none`}
                      style={{
                        fontFamily: 'monospace',
                        lineHeight: '1.6',
                        fontSize: '14px'
                      }}
                    />
                  ) : (
                    <div className={`w-full h-96 px-6 py-4 border-2 rounded-2xl overflow-y-auto ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                      <div className="whitespace-pre-wrap break-words" style={{ lineHeight: '1.6' }}>
                        {renderContent(noteForm.content)}
                      </div>
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => setIsCodeMode(false)}
                          className={`px-4 py-2 text-sm rounded-lg transition-colors ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'}`}
                        >
                          ✏️ Click to edit
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {noteForm.content.length} characters
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {isCodeMode ? '👀 Preview mode active' : '📝 Edit mode'}
                  </div>
                </div>

                <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                  <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    💡 Pro Tip: Code Highlighting
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Wrap your code with <code className={`px-2 py-1 rounded ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>```javascript</code> to get syntax highlighting!
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleSaveNote}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {editingNote ? '💾 Update Note' : '🚀 Save Note'}
                </button>
                <button
                  onClick={() => {
                    setShowNoteModal(false);
                    setEditingNote(null);
                    setNoteForm({ title: '', categoryId: '', content: '' });
                  }}
                  className={`px-8 py-4 rounded-2xl font-medium transition-all duration-300 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg p-8 max-w-md w-full transition-all duration-300 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-2xl`}>
            <h2 className={`text-2xl font-bold mb SIX-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              🏷️ Add New Category
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Category name..."
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${darkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400'
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
                  }`}
              />

              <div>
                <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Choose Color Theme
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {gradientColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setCategoryForm({ ...categoryForm, color })}
                      className={`h-12 rounded-xl bg-gradient-to-r ${color} transition-transform ${categoryForm.color === color ? 'scale-110 ring-4 ring-white' : 'hover:scale-105'}`}
                    >
                      {categoryForm.color === color && <span className="text-white font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveCategory}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
              >
                💾 Save Category
              </button>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setCategoryForm({ name: '', color: 'from-blue-400 to-cyan-500' });
                }}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Read Mode */}
      {readMode && (
        <div className={`fixed inset-0 z-50 ${darkMode ? 'bg-gray-900' : 'bg-white'} overflow-y-auto`}>
          <div className={`sticky top-0 z-10 ${darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-sm border-b px-6 py-4`}>
            <div className="flex justify-between items-center max-w-4xl mx-auto">
              <div className="flex items-center gap-4">
                <button
                  onClick={closeReadMode}
                  className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  ← Back
                </button>
                <div>
                  <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {readMode.title}
                  </h1>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {getCategoryById(readMode.categoryId)?.name} • {readMode.createdAt.toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Size:</span>
                  <button
                    onClick={() => setFontSize('small')}
                    className={`px-2 py-1 text-xs rounded transition-colors ${fontSize === 'small'
                      ? 'bg-blue-500 text-white'
                      : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    A
                  </button>
                  <button
                    onClick={() => setFontSize('medium')}
                    className={`px-2 py-1 text-sm rounded transition-colors ${fontSize === 'medium'
                      ? 'bg-blue-500 text-white'
                      : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    A
                  </button>
                  <button
                    onClick={() => setFontSize('large')}
                    className={`px-2 py-1 text-lg rounded transition-colors ${fontSize === 'large'
                      ? 'bg-blue-500 text-white'
                      : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    A
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Font:</span>
                  <button
                    onClick={() => setFontFamily(fontFamily === 'sans' ? 'serif' : 'sans')}
                    className={`px-3 py-1 text-sm rounded transition-colors ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {fontFamily === 'sans' ? 'Serif' : 'Sans'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={`max-w-4xl mx-auto px-6 py-12 ${fontFamily === 'serif' ? 'font-serif' : 'font-sans'} ${fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-xl leading-relaxed' : 'text-base leading-relaxed'}`}>
            <div className={`prose max-w-none ${darkMode ? 'prose-invert prose-headings:text-white prose-p:text-gray-300' : 'prose-gray'} ${fontSize === 'large' ? 'prose-lg' : fontSize === 'small' ? 'prose-sm' : 'prose-base'}`}>
              {renderContent(readMode.content)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;