# Contributing to ColabShopper

Thank you for your interest in contributing to ColabShopper! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background, experience level, gender, gender identity, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.

### Expected Behavior

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Be open to different perspectives
- Show empathy towards others

## 🚀 Getting Started

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/yourusername/colabshopper.git
   cd colabshopper
   ```

2. **Set up the development environment**
   ```bash
   # Backend
   cd colabshopper-backend
   npm install
   cp .env.example .env  # Create .env file
   
   # Frontend
   cd ../colabshopper-frontend
   npm install
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 💻 Development Process

### Backend Development

1. Make sure MongoDB is running
2. Start the development server:
   ```bash
   cd colabshopper-backend
   npm run dev
   ```
3. The server will auto-reload on file changes

### Frontend Development

1. Start the development server:
   ```bash
   cd colabshopper-frontend
   npm start
   ```
2. The app will open at http://localhost:3000 with hot-reload enabled

### Testing Your Changes

- **Backend**: Use Postman collection or test manually
- **Frontend**: Run `npm test` in the frontend directory
- **Build**: Ensure both build successfully:
  ```bash
  # Backend
  cd colabshopper-backend && npm start
  
  # Frontend
  cd colabshopper-frontend && npm run build
  ```

## 🎨 Code Style

### JavaScript/TypeScript

- Use **ES6+** syntax
- Follow **ESLint** rules (already configured)
- Use **camelCase** for variables and functions
- Use **PascalCase** for components/classes
- Use **UPPER_CASE** for constants

### Code Formatting

- Use **2 spaces** for indentation
- Use **single quotes** for strings (JavaScript)
- Use **double quotes** for strings (TypeScript/JSX)
- Add semicolons at the end of statements
- Keep lines under 100 characters when possible

### Example

```javascript
// Good
const getUserLists = async (userId) => {
  try {
    const response = await api.get(`/lists?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch lists:', error);
    throw error;
  }
};

// Bad
const getUserLists = async(userId)=>{
try{
const response=await api.get('/lists?userId='+userId)
return response.data
}catch(error){console.error(error)}
}
```

### React/Component Guidelines

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use TypeScript for type safety (frontend)

```tsx
// Good
interface Props {
  name: string;
  onSave: (value: string) => void;
}

const EditableField: React.FC<Props> = ({ name, onSave }) => {
  const [value, setValue] = useState(name);
  
  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onSave(value)}
    />
  );
};
```

### CSS/Styling

- Use consistent class naming (kebab-case)
- Keep styles organized by component
- Use CSS variables for theme colors
- Make responsive designs mobile-first

```css
/* Good */
.user-profile {
  padding: 1rem;
  background: var(--primary-color);
}

.user-profile__avatar {
  width: 80px;
  height: 80px;
}

/* Bad */
.userProfile {
  padding: 16px;
}
```

## 📝 Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(list): add filter functionality for columns

Add filter buttons to column headers that allow users to filter
items by column values. Includes dropdown UI and filter state management.

Closes #123

---

fix(api): correct WebSocket reconnection logic

Prevent infinite reconnection loops by properly cleaning up WebSocket
connections and tracking reconnection attempts.

---

docs(readme): update installation instructions

Add Docker Compose setup instructions and environment variable examples.
```

## 🔀 Pull Request Process

1. **Before submitting:**
   - Ensure your code follows the style guidelines
   - Test your changes thoroughly
   - Update documentation if needed
   - Make sure the build passes

2. **Create the PR:**
   - Push your branch to your fork
   - Open a Pull Request on GitHub
   - Fill out the PR template:
     - Description of changes
     - Related issues
     - Screenshots (if UI changes)
     - Testing instructions

3. **PR Title Format:**
   ```
   <type>: <brief description>
   ```
   Example: `feat: Add column filtering functionality`

4. **During Review:**
   - Respond to feedback promptly
   - Make requested changes
   - Update the PR as needed
   - Keep the branch up to date with main

5. **After Approval:**
   - Maintainers will merge your PR
   - Your contribution will be credited

## 🐛 Reporting Bugs

### Before Reporting

1. Check if the bug has already been reported
2. Test with the latest version
3. Try to reproduce the issue

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of the bug.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., macOS 12.0]
- Browser: [e.g., Chrome 96]
- Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information.
```

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Mockups, examples, or other relevant information.
```

## 📚 Documentation

When contributing:

- **Code Comments**: Add comments for complex logic
- **README Updates**: Update README if adding new features
- **API Docs**: Update API_DOCUMENTATION.md for API changes
- **Inline Docs**: Document function parameters and return values

## 🧪 Testing

### Backend Testing

- Test API endpoints with Postman or curl
- Verify error handling
- Test edge cases

### Frontend Testing

```bash
cd colabshopper-frontend
npm test
```

- Write tests for new components
- Test user interactions
- Test edge cases

## 🔍 Code Review Guidelines

### For Contributors

- Be open to feedback
- Explain your decisions if asked
- Respond to comments constructively

### For Reviewers

- Be respectful and constructive
- Explain why changes are needed
- Approve when ready or request changes clearly

## 📦 Dependencies

When adding new dependencies:

- **Backend**: Get approval for new npm packages
- **Frontend**: Consider bundle size impact
- **Security**: Check for known vulnerabilities
- **Documentation**: Update if dependencies change significantly

## 🎯 Priority Areas

We especially welcome contributions in these areas:

1. **Testing**: Adding test coverage
2. **Documentation**: Improving docs
3. **Performance**: Optimizations
4. **Accessibility**: Improving a11y
5. **Mobile UX**: Mobile experience improvements
6. **Error Handling**: Better error messages
7. **Security**: Security improvements

## ❓ Questions?

If you have questions:

1. Check existing issues and discussions
2. Open a new issue with the "question" label
3. Reach out to maintainers

## 🙏 Thank You!

Thank you for taking the time to contribute to ColabShopper! Every contribution, big or small, is valued and appreciated.

---

**Happy coding! 🚀**

