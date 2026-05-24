# Contributing to Green Earth

Thank you for your interest in contributing to the Green Earth tree planting platform! This document provides guidelines and instructions for contributing to our project.

## Getting Started

### Prerequisites

- Node.js v16 or higher
- npm or yarn package manager
- Git

### Development Setup

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Development Workflow

### Code Style

We follow strict code quality standards:

- **ESLint**: Run `npm run lint` before committing
- **Prettier**: Run `npm run format` to auto-format code
- Use `.prettierrc.json` and `eslint.config.js` for reference

### Making Changes

1. Create a feature branch from `main`
2. Make your changes following our code style
3. Write descriptive commit messages using conventional commits:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `style:` for formatting changes
   - `refactor:` for code refactoring
   - `perf:` for performance improvements
   - `test:` for test changes
   - `chore:` for build/dependency changes

Example: `feat: add dark mode toggle to gallery`

### Testing

Before submitting a pull request:

1. Run tests:
   ```bash
   npm test
   ```
2. Run linter:
   ```bash
   npm run lint
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Test the production build:
   ```bash
   npm run preview
   ```

### Commit Guidelines

- Use clear, descriptive commit messages
- Keep commits focused on a single change
- Reference issues when applicable: `Fixes #123`
- Follow the conventional commits format

Example commit message:

```
fix: prevent cart items from being duplicated on checkout

- Add item deduplication logic
- Prevents duplicate charges
- Fixes #456
```

## Pull Request Process

1. Ensure all tests pass: `npm test`
2. Update documentation if needed
3. Add a clear description of your changes
4. Reference any related issues
5. Wait for code review

### PR Description Template

```markdown
## Description

Brief description of the changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing

- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] No breaking changes

## Related Issues

Fixes #123
```

## Code Standards

### JavaScript/React

- Use `const` by default, `let` when needed, never `var`
- Use template literals for string interpolation
- Use arrow functions in callbacks
- Add JSDoc comments for functions and classes
- Keep functions small and focused

### CSS

- Use Tailwind utility classes preferentially
- Keep custom CSS minimal
- Use CSS variables for theming

### Accessibility

- Use semantic HTML elements
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers

## Reporting Issues

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos if applicable
- Your environment (browser, OS, Node version)

## Questions or Need Help?

- Check existing issues and documentation
- Open a discussion for questions
- Comment on related issues for clarification

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Green Earth! 🌱
