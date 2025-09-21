# Learning Notes App

A React-based web application for capturing, organizing, and mastering your knowledge. This app allows users to create, edit, categorize, and export notes with a modern and interactive UI, featuring dark/light mode, markdown support, and PDF export functionality.

## Features

- **Note Management**: Create, edit, delete, and pin notes for easy access.
- **Categories**: Organize notes into customizable categories with gradient color themes.
- **Search & Filter**: Search notes by title or content and filter by categories.
- **Markdown Support**: Format notes with markdown syntax (bold, italic, headings, quotes, lists, and code blocks).
- **Dark/Light Mode**: Toggle between dark and light themes for a comfortable viewing experience.
- **PDF Export**: Export individual notes or all notes as a beautifully formatted PDF.
- **Read Mode**: View notes in a distraction-free, customizable read mode with adjustable font size and family.
- **Local Storage**: Persist notes, categories, and drafts using browser localStorage.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Interactive UI**: Features card flipping animations, hover effects, and a floating particles background for a modern look.

## Tech Stack

- **React**: JavaScript library for building the user interface.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **LocalStorage**: For persistent data storage in the browser.
- **Markdown Parsing**: Custom rendering for markdown content with syntax highlighting for code blocks.

## Installation

1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd learning-notes-app
   ```

2. **Install Dependencies**: Ensure you have Node.js installed, then run:

   ```bash
   npm install
   ```

3. **Run the App**: Start the development server:

   ```bash
   npm start
   ```

   The app will be available at `http://localhost:3000`.

## Usage

1. **Create a Note**:

   - Click the "Create New Note" card.
   - Enter a title, select a category, and write content using markdown syntax.
   - Use the formatting toolbar or insert code blocks for enhanced note-taking.
   - Save the note or cancel to discard changes.

2. **Organize Notes**:

   - Add new categories with custom names and color themes.
   - Filter notes by categories or search using the search bar.
   - Pin important notes to keep them at the top.

3. **Export Notes**:

   - Export a single note or all notes as a PDF from the note's action menu.
   - PDFs include formatted content, categories, and metadata.

4. **Customize Experience**:

   - Toggle between dark and light modes.
   - Adjust font size and family in read mode for better readability.

## File Structure

- `src/App.js`: Main React component containing the app's logic and UI.
- `src/App.css`: Custom CSS for additional styling (used alongside Tailwind CSS).
- `public/index.html`: Entry point for the React app.

## Notes

- **Data Persistence**: All notes and categories are stored in the browser's localStorage.
- **Markdown Tips**: Use `**bold**`, `*italic*`, `## Heading`, `> Quote`, `- List item`, and `javascript\ncode\n` for formatting.
- **PDF Export**: Ensure pop-up blockers are disabled for PDF generation to work smoothly.

## Future Improvements

- Add cloud syncing for cross-device access.
- Implement user authentication for private notes.
- Add support for importing/exporting notes in JSON format.
- Enhance markdown rendering with additional formats (e.g., tables, images).

## License

This project is licensed under the MIT License.
