# Contributing to Complete Interview Prep Platform

First off, thank you for considering contributing to the Complete Interview Prep Platform! 🎉

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open source project. In return, they should reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests.

## 🤝 How Can I Contribute?

### Reporting Bugs 🐛

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed and what behavior you expected**
- **Include screenshots if applicable**
- **Include details about your environment** (OS, browser, Node.js version, etc.)

### Suggesting Enhancements 💡

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the enhancement**
- **Describe the current behavior and explain the expected behavior**
- **Explain why this enhancement would be useful**

### Code Contributions 🔧

#### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/complete-interview-prep-guide.git
   cd complete-interview-prep-guide
   ```
3. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Setting Up Development Environment

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp env.example .env.local
   # Fill in your API keys and configuration
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

#### Making Changes

1. **Follow the existing code style**
2. **Write clear, readable code with comments**
3. **Test your changes thoroughly**
4. **Update documentation as needed**
5. **Follow the commit message conventions**

#### Commit Message Guidelines

We follow a consistent commit message format:

```
type(scope): brief description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(ai): add personalized study recommendations
fix(calendar): resolve date selection issue
docs(readme): update installation instructions
```

#### Pull Request Process

1. **Update documentation** for any new features
2. **Ensure all tests pass** and code follows style guidelines
3. **Update the README.md** if needed
4. **Create a pull request** with:
   - Clear title and description
   - Reference to any related issues
   - Screenshots for UI changes
   - Testing instructions

## 📋 Development Guidelines

### Code Style

- Use **TypeScript** for type safety
- Follow **ESLint** configuration
- Use **Prettier** for code formatting
- Follow **React/Next.js** best practices
- Write **self-documenting code** with clear variable names

### File Structure

```
complete-interview-prep-guide/
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/                   # Utility functions and services
├── types/                 # TypeScript type definitions
├── data/                  # Static data and configurations
├── hooks/                 # Custom React hooks
├── supabase/             # Database schema and migrations
└── public/               # Static assets
```

### Component Guidelines

- Use **functional components** with hooks
- Implement **proper TypeScript types**
- Follow **single responsibility principle**
- Write **reusable components**
- Use **proper error handling**

### API Guidelines

- Follow **RESTful conventions**
- Implement **proper error handling**
- Use **TypeScript interfaces** for API responses
- Document **API endpoints** clearly

## 🧪 Testing

- Write tests for new features
- Ensure existing tests pass
- Test across different browsers and devices
- Test with different user scenarios

## 📚 Documentation

- Update README.md for major changes
- Document new API endpoints
- Add inline code comments for complex logic
- Update type definitions

## 🎯 Areas We Need Help With

- **UI/UX Improvements**: Better design and user experience
- **Additional Study Topics**: More comprehensive coverage
- **Performance Optimizations**: Faster loading and better performance
- **Mobile Responsiveness**: Better mobile experience
- **Accessibility**: Making the platform more accessible
- **Testing**: Unit tests, integration tests, and E2E tests
- **Documentation**: Better guides and API documentation

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Code Reviews**: We'll review your pull requests promptly

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Special mentions in project documentation

Thank you for contributing to the Complete Interview Prep Platform! 🚀 