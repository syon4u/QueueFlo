
# QUEUE FLOW

QUEUE FLOW is a modern queue management system that helps businesses efficiently manage customer wait times and improve service delivery.

## Features

- **Real-time Queue Management**: Track and update customer positions in real-time
- **Role-based Access Control**: Different interfaces for customers, staff, and administrators
- **Wait Time Estimation**: Provide customers with accurate wait time estimates
- **Multi-language Support**: Available in English and Spanish
- **Progressive Web App**: Install on any device for offline capabilities
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm 9 or higher

### Installation

```sh
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd queue-flow

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Testing

```sh
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Check test coverage
npm run test:coverage
```

## Deployment

QUEUE FLOW is set up for continuous deployment with GitHub Actions. Every push to the main branch triggers:

1. Build and test
2. Lighthouse CI verification (ensuring performance, accessibility, SEO, and best practices scores ≥90)
3. Deployment to production

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **State Management**: React Context API, TanStack Query
- **Backend**: Supabase (Authentication, Database, Edge Functions)
- **Testing**: Vitest, React Testing Library
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Version History

- **v1.0.0-beta** (May 2025): Initial beta release with core functionality
