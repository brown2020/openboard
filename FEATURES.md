# OpenBoard Features

> 📖 **See also**: [README.md](README.md) for quick start and installation guide.

This document provides detailed information about OpenBoard's features and technical implementation.

## Rich Text Editing

OpenBoard now includes a powerful rich text editor built with **Tiptap**, a world-class open-source editor based on ProseMirror.

### Rich Text Block Features

- **Formatting Options**:
  - Bold, Italic, Underline, Strikethrough
  - Inline code formatting
- **Headings**:
  - H1, H2, H3 heading styles
  - Perfect for structuring content
- **Lists**:
  - Bullet lists
  - Numbered lists
  - Nested list support
- **Text Alignment**:
  - Left align
  - Center align
  - Right align
- **Advanced Features**:
  - Link insertion with custom URLs
  - Blockquotes for emphasis
  - Undo/Redo support
- **User Experience**:
  - Real-time WYSIWYG editing
  - Intuitive toolbar with icon buttons
  - Placeholder text support
  - Responsive design
  - Dark mode support

### How to Use Rich Text

1. In the board editor, click "Add Block"
2. Select "Rich Text" from the Content section
3. Start typing in the editor
4. Use the toolbar to format your text
5. Click "Add Rich Text" to add the block to your board

## Enhanced Block Editing

All blocks now support inline editing with improved UX:

### Editing Controls

Each block in edit mode shows hover controls:

- **Edit** (✏️): Edit block content inline
- **Visibility** (👁️): Toggle block visibility
- **Delete** (🗑️): Remove block from board

### Drag & Drop Reordering

- Hover over blocks to see drag handles
- Click and drag to reorder blocks
- Changes save automatically
- Smooth animations and transitions

### Block Types

#### 1. Rich Text Block

- Full WYSIWYG editor
- All text formatting options
- Perfect for paragraphs, articles, and formatted content

#### 2. Simple Text Block

- Plain text without formatting
- Quick and simple
- Good for short notes

#### 3. Link Block

- Clickable link cards
- Optional icon (emoji)
- Optional description
- External link indicator

#### 4. Button Block

- Call-to-action buttons
- Multiple styles (Primary, Secondary, Outline, Ghost)
- Three sizes (Small, Medium, Large)
- Opens in new tab

#### 5. Image Block

- Image display with captions
- Optional link
- Multiple aspect ratios (Auto, Square, Portrait, Landscape)
- Lazy loading optimized

#### 6. Divider Block

- Visual separator
- Multiple styles
- Helps organize content

#### 7. Spacer Block

- Vertical spacing control
- Multiple heights
- Improves layout flow

## Board Editor Improvements

### Inline Title & Description Editing

- Click on board title to edit
- Click on description to edit
- Live preview as you type

### Organized Add Block Menu

Blocks are now organized by category:

- **Content**: Rich Text, Simple Text
- **Interactive**: Links, Buttons
- **Media**: Images
- **Layout**: Dividers, Spacers

### Visual Polish

- Smooth hover effects
- Professional animations
- Consistent spacing
- Better visual hierarchy

## Technical Implementation

### Technology Stack

- **Tiptap**: Rich text editing
- **@dnd-kit**: Drag and drop functionality
- **React**: Component architecture
- **TypeScript**: Type safety
- **Zustand**: State management
- **Tailwind CSS**: Styling

### Architecture

- Modular block system
- Type-safe block definitions
- Composable editor components
- Optimized rendering
- Persistent state management

### Performance

- Lazy loading for images
- Optimized re-renders
- Efficient state updates
- Smooth animations with CSS transforms

## Future Enhancements

Potential additions:

- Video embed blocks
- Social media link collections
- Calendar integration
- Custom form blocks
- Color picker for text
- Image upload from device
- Code block with syntax highlighting
- Table support
- Emoji picker
- More text formatting options
