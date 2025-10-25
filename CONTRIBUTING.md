# Contributing to OpenBoard

Thank you for considering contributing to OpenBoard! This document provides guidelines and instructions for contributing.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug:

1. Check if it's already reported in [Issues](https://github.com/yourusername/openboard/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, Node version)

### Suggesting Features

We love new ideas! To suggest a feature:

1. Check [existing feature requests](https://github.com/yourusername/openboard/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach
   - Mockups/examples if applicable

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**

   - Follow the code style guidelines below
   - Add tests if applicable
   - Update documentation

4. **Commit your changes**

   ```bash
   git commit -m 'Add amazing feature'
   ```

5. **Push to your fork**

   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Describe what you've changed and why
   - Reference any related issues
   - Add screenshots for UI changes

## 💻 Development Setup

See [SETUP.md](SETUP.md) for detailed setup instructions.

Quick start:

```bash
git clone https://github.com/yourusername/openboard.git
cd openboard
npm install
cp env.example .env.local
# Add your credentials to .env.local
npm run dev
```

## 📝 Code Style Guidelines

### TypeScript

- Use TypeScript for all new files
- Define proper types (avoid `any`)
- Use interfaces for object shapes
- Export types from `src/types/index.ts`

**Good:**

```typescript
interface ButtonProps {
  text: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export function Button({ text, onClick, variant = "primary" }: ButtonProps) {
  // ...
}
```

**Bad:**

```typescript
export function Button(props: any) {
  // ...
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper file naming: `kebab-case.tsx`

**Good:**

```typescript
// components/user-avatar.tsx
export function UserAvatar({ user }: { user: User }) {
  return <img src={user.avatar} alt={user.name} />;
}
```

### State Management

- Use Zustand for global state
- Keep state close to where it's used
- Use custom hooks to encapsulate logic

**Good:**

```typescript
// hooks/use-boards.ts
export function useBoards() {
  const { boards, setBoards } = useBoardStore();

  const loadBoards = useCallback(async () => {
    // Implementation
  }, []);

  return { boards, loadBoards };
}
```

### Styling

- Use Tailwind CSS utility classes
- Keep inline styles minimal
- Use `cn()` utility for conditional classes

**Good:**

```typescript
<div className={cn(
  "rounded-lg p-4",
  isActive && "bg-primary",
  isDisabled && "opacity-50"
)}>
```

### File Structure

```
src/
├── app/              # Next.js pages and routes
├── components/       # Reusable components
│   ├── blocks/      # Block type components
│   ├── modals/      # Modal components
│   └── ui/          # Base UI components
├── hooks/           # Custom React hooks
├── lib/             # Utilities and helpers
├── stores/          # Zustand stores
└── types/           # TypeScript types
```

## 🧪 Testing

- Write tests for new features
- Ensure existing tests pass
- Test in multiple browsers

```bash
npm test
```

## 📄 Documentation

- Update README.md for major changes
- Add JSDoc comments for complex functions
- Update SETUP.md for setup changes
- Include inline comments for complex logic

## 🎨 Design Guidelines

### UI/UX Principles

- **Mobile-first** - Design for mobile, enhance for desktop
- **Accessibility** - Use semantic HTML, ARIA labels
- **Performance** - Optimize images, lazy load when possible
- **Consistency** - Follow existing design patterns

### Component Design

- Use Shadcn UI components as base
- Maintain consistent spacing (4px, 8px, 16px, 24px, 32px)
- Follow color scheme in globals.css
- Support dark mode

## 🐛 Bug Fix Guidelines

1. Create an issue describing the bug
2. Create a branch: `fix/issue-number-description`
3. Fix the bug with minimal changes
4. Add a test to prevent regression
5. Submit PR referencing the issue

## ✨ Feature Guidelines

1. Discuss in an issue first for large features
2. Create a branch: `feature/feature-name`
3. Implement the feature following code style
4. Add documentation
5. Submit PR with screenshots/demo

## 🔍 Code Review Process

All PRs require:

- Passing CI/CD checks
- Code review from maintainer
- No merge conflicts
- Updated documentation

Reviews focus on:

- Code quality and style
- Test coverage
- Performance impact
- Security considerations
- UX/UI consistency

## 📋 Commit Message Guidelines

Use clear, descriptive commit messages:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

**Examples:**

```
feat: add drag-and-drop block reordering
fix: resolve analytics tracking issue
docs: update setup guide with Firebase steps
```

## 🎯 Priority Areas

We're especially looking for contributions in:

- [ ] Drag-and-drop block reordering
- [ ] Additional block types (polls, countdown, etc.)
- [ ] Advanced analytics charts
- [ ] Mobile app
- [ ] Internationalization (i18n)
- [ ] Performance optimizations
- [ ] Accessibility improvements

## 📞 Getting Help

Need help contributing?

- Comment on the issue you're working on
- Ask in GitHub Discussions
- Join our Discord (coming soon)
- Email: dev@openboard.com

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to OpenBoard! 🎉
