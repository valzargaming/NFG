# Contributing

Thanks for your interest in contributing to NFG. The project follows a simple
workflow — fork, branch, implement, test, and open a pull request.

Prerequisites

- Node.js 16+ and npm

Steps

1. Fork the repository and create a feature branch from `main`.
2. Install dependencies:

```bash
npm install
```

3. Run tests and ensure they pass:

```bash
npm test
```

4. Run the code style fixer before submitting:

```bash
npm run cs-fixer
```

5. Add or update tests for any bug fixes or new features.
6. Commit with a clear message and push your branch.
7. Open a pull request describing the change and linking any relevant
   issues.

Guidelines

- Keep pull requests small and focused.
- Include tests for bug fixes and new features.
- Run `npm run cs-fixer` to format and auto-fix code before opening a PR.
- Use clear, descriptive commit messages.

Code Style

- Prettier and ESLint are used for formatting and linting. See
  `package.json` scripts for `cs-fixer`.

Support
If you need help, open an issue describing the problem and environment.

Thank you for contributing!
