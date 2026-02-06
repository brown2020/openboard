# Competitor Analysis: Notion

## Context

OpenBoard is a shareable page/link-in-bio builder. Notion is a workspace tool that includes published pages (Notion Sites). We're not trying to become Notion — we're studying what makes Notion's page editor world-class and applying those lessons to make OpenBoard's editor feel just as good, while staying focused on our niche: beautiful, shareable public pages.

---

## 1. Core Value Prop

**What Notion solves:** Notion is an all-in-one workspace for notes, docs, project management, wikis, and databases. People use it because it replaces multiple tools (Google Docs, Trello, Confluence, Airtable) with one flexible interface.

**What Notion Sites solves:** A subset of Notion that lets you publish any page as a public website. Used for portfolios, help docs, landing pages, and link-in-bio pages. This is the feature that directly competes with OpenBoard.

**Why people love Notion's editor:**
- Everything is a block — uniform mental model
- Slash commands (`/`) for instant access to any block type
- Drag-and-drop that actually feels good
- Inline editing — no modal hell, no separate edit mode
- Keyboard-first — power users never touch the mouse
- Beautiful by default — minimal effort to make pages look good

---

## 2. Feature Breakdown

### Page Editor (directly relevant to us)
| Feature | How it works |
|---------|-------------|
| Block system | Every piece of content is a block. Blocks have a uniform interaction model: hover for handle, click to select, type to edit |
| Slash commands | Type `/` anywhere to search and insert any block type. Fuzzy search. Keyboard navigable |
| Inline editing | Click any block to edit it in place. No edit mode toggle, no modals for basic edits |
| Drag-and-drop | Grab the `⋮⋮` handle to move blocks. Visual drop indicator. Multi-column support by dragging blocks side-by-side |
| Multi-column layouts | Drag a block next to another to create columns. Adjustable column widths |
| Turn into | Select a block and change its type (e.g., text → heading, bullet list → numbered list) |
| Block menu | Click the `⋮⋮` handle to get: duplicate, delete, turn into, color, comment, move to |
| Selection | Click and drag to select multiple blocks. Bulk operations on selection |
| Keyboard shortcuts | Cmd+B/I/U, Cmd+Shift+H for highlight, Cmd+E for code, Cmd+K for link, Markdown shortcuts |
| Markdown support | Type `#` for heading, `-` for bullet, `>` for quote, `1.` for numbered list, ``` for code |
| Cover images | Full-width cover image at top of page. Upload, Unsplash, or gradient |
| Icons | Emoji or uploaded icon for the page. Shows in sidebar and as favicon |
| Table of contents | Auto-generated from headings |
| Breadcrumbs | Navigation showing page hierarchy |
| Comments | Inline comments on any block |
| Version history | See and restore previous versions (paid) |

### Block Types (relevant subset)
| Block | What it does |
|-------|-------------|
| Text | Paragraph text with inline formatting |
| Headings (H1-H3) | Section headings |
| Bullet list | Unordered lists with nesting |
| Numbered list | Ordered lists with nesting |
| To-do | Checkboxes |
| Toggle | Collapsible content |
| Quote | Styled blockquote |
| Callout | Highlighted box with icon |
| Divider | Horizontal separator |
| Image | Upload, embed, or Unsplash |
| Video | YouTube, Vimeo, or upload |
| Embed | Any URL (auto-detected) |
| Bookmark | Rich link preview with title, description, favicon |
| Code | Syntax-highlighted code block |
| Table | Simple table (not database) |
| Button | Custom action button |
| Synced block | Block that mirrors content across pages |
| Column layout | Side-by-side content |

### Publishing (Notion Sites)
| Feature | Details |
|---------|---------|
| One-click publish | Toggle publish on any page |
| Custom domain | Connect your own domain (paid add-on) |
| SEO controls | Title, description, social preview image |
| Google Analytics | Integration on paid plans |
| Theming | Font, colors, header style |
| Navigation | Auto-generated site nav from page structure |
| Password protection | Restrict access with password |
| Link expiration | Time-limited access |

### Collaboration
| Feature | Details |
|---------|---------|
| Real-time co-editing | Multiple people editing simultaneously |
| Comments | Inline and page-level comments |
| Mentions | @mention users in content |
| Permissions | View, comment, edit at page level |
| Guest access | Invite external collaborators |

---

## 3. UX Strengths (what they get right)

### The Editor Feels Like Paper
- No distinction between "view mode" and "edit mode" — you just click and type
- Content appears exactly as it will look when published
- The UI gets out of the way — minimal chrome, maximum content

### Slash Commands Are Addictive
- Universal access to everything via `/`
- Fuzzy search so you don't need to remember exact names
- Recently used blocks surface first
- Zero mouse interaction needed to add any block type

### Blocks Are First-Class
- Every block has the same interaction pattern: hover → handle appears → click for menu or drag to move
- Turning a block into a different type preserves content where possible
- Copy/paste blocks between pages works seamlessly

### Keyboard-First Design
- Full keyboard navigation between blocks (arrow keys)
- Markdown shortcuts for common formatting
- Tab/Shift+Tab for indentation and nesting
- Escape to deselect, Enter to create new block

### Visual Polish
- Smooth animations on drag-and-drop
- Subtle hover states that guide interaction
- Consistent spacing and typography
- Placeholder text that guides empty states
- Cover images and icons add personality with minimal effort

---

## 4. UX Weaknesses (what they get wrong — our opportunities)

### Overwhelming Complexity
- New users face a steep learning curve. Notion's flexibility is its weakness — too many options, too many ways to do things
- Setting up a page for public sharing requires understanding publishing settings, domains, SEO, themes — lots of steps
- **Our opportunity:** OpenBoard should be dead simple. Create account → choose template → customize → share link. Under 2 minutes.

### Slow Performance
- Notion is notoriously slow, especially on mobile. Pages take seconds to load
- The editor can lag on pages with many blocks
- **Our opportunity:** OpenBoard is a focused tool — we can be fast. Public pages should load instantly (static generation). Editor should be snappy.

### Poor Mobile Experience
- The editor is clunky on mobile. Drag-and-drop barely works
- Published pages aren't always well-optimized for mobile viewing
- **Our opportunity:** OpenBoard pages are mobile-first by design (link-in-bio use case). The mobile viewing experience should be perfect.

### Generic Aesthetic
- Notion pages all look the same. The design language is recognizable (and that's not always good for personal branding)
- Limited theming options — you get Notion's look, period
- **Our opportunity:** OpenBoard has rich theming (gradients, custom colors, fonts). Each page can look completely unique.

### Publishing Is an Afterthought
- Notion Sites is a bolt-on feature, not the core product. The publishing flow feels like an afterthought
- No built-in analytics worth using. No click tracking on links
- No social link aggregation, no link-in-bio optimization
- **Our opportunity:** Publishing IS our core product. Every feature should serve the "share this page" use case.

### No Free Custom Domain
- Custom domains require a paid add-on
- **Our opportunity:** We could offer subdomain customization (username.openboard.app) for free

### Bad Billing Practices
- Users frequently complain about unexpected charges, difficulty canceling, and poor support
- **Our opportunity:** We're free and open source. No billing surprises, ever.

---

## 5. Table Stakes (must have to be taken seriously)

These are features any block-based page builder must have in 2026:

| Feature | Status in OpenBoard | Priority |
|---------|-------------------|----------|
| Inline editing (no modal for every change) | Partial — many blocks require edit mode toggle | Must fix |
| Slash commands with search | Have it, basic implementation | Must improve |
| Smooth drag-and-drop reorder | Have it via dnd-kit | Good enough |
| Keyboard shortcuts | Have basics (Cmd+S, Cmd+Z, arrow nav) | Must expand |
| Undo/redo | Have it | Good enough |
| Rich text with formatting toolbar | Have it via Tiptap | Good enough |
| Image upload | Have it | Good enough |
| Video embeds | Have it | Good enough |
| Responsive/mobile-optimized public pages | Have it | Must verify |
| Page themes/customization | Have it (gradients, colors, fonts) | Good — this is a strength |
| SEO basics (title, description) | Have it (partial) | Must improve |
| Link sharing with preview | Have it | Good enough |
| Password protection | Have it | Good enough |
| Loading states and error handling | Inconsistent | Must fix |
| Empty states | Missing in several places | Must add |

---

## 6. Differentiators (where we can win, not just match)

### 1. Simplicity Over Flexibility
Notion gives you a blank canvas and says "figure it out." OpenBoard gives you a purpose-built tool. Every feature serves one goal: make a beautiful shareable page. No databases, no wikis, no project management — just pages that look amazing and share well.

### 2. Templates That Actually Ship
Notion templates are starting points you customize. OpenBoard templates should be complete, beautiful pages you can publish immediately — just swap in your content. Think Squarespace-level templates, not blank canvases.

### 3. Purpose-Built Analytics
Notion has no meaningful analytics for published pages. OpenBoard should have built-in analytics that matter for the use case: page views, link clicks, referrer breakdown, device breakdown, geographic data. This is a massive differentiator.

### 4. Social-First Design
OpenBoard pages are designed to be shared on social media. Open Graph previews, mobile optimization, fast loading — these should be best-in-class. Notion pages look generic when shared on social.

### 5. Open Source Trust
Notion is a closed platform. OpenBoard is open source — users own their data, can self-host, and can verify there's no tracking or lock-in. This matters to developers, privacy-conscious users, and organizations.

### 6. Instant Publishing
No publish toggle, no domain setup, no SEO forms to fill out. Every board has a public URL from the moment it's created. Copy the link and share. Publishing should be zero-friction.

### 7. Link-in-Bio Optimization
Features specifically designed for the link-in-bio use case that Notion doesn't have:
- Click tracking per link
- Social link aggregation (show all your platforms in one grid)
- Contact forms
- Scheduling/calendar embeds
- QR code generation
- One-tap link copying
