# MyMedusaApp

A mobile application for Medusa e-commerce platform built with React Native and Expo.

## Project Structure

```
MyMedusaApp/
├── app/                    # Expo Router app directory
│   ├── (tabs)/             # Main tab navigation screens
│   │   ├── products/       # Product listing and details
│   │   ├── cart.tsx        # Shopping cart screen
│   │   ├── home.tsx        # Home screen
│   │   └── ...
│   └── _layout.tsx         # Root layout component
├── src/                    # Application source code
│   ├── api/                # API client and configuration
│   ├── components/         # Reusable component library
│   ├── hooks/              # Custom React hooks
│   ├── screens/            # Screen components
│   ├── services/           # Service layer (API interfaces)
│   ├── state/              # State management (Context API)
│   ├── styles/             # Shared styles
│   └── utils/              # Utility functions
├── assets/                 # Static assets (images, fonts)
├── components/             # Shared UI components
├── constants/              # Application constants
└── hooks/                  # Shared hooks
```

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Clone the repository
```
git clone <repository-url>
cd MyMedusaApp
```

2. Install dependencies
```
npm install
# or
yarn install
```

3. Start the development server
```
npm start
# or
yarn start
```

4. Open the app on your device or emulator using Expo Go

## Connecting to Medusa Backend

This app is configured to connect to a Medusa backend server. Update the Medusa API connection settings in:

```
src/api/medusaClient.ts
```

## Features

- Product browsing and search
- Shopping cart functionality
- User authentication
- Order management
- Shipping address management
- Mini game feature

## Architecture

The app uses:

- **Expo Router** for navigation
- **Context API** for state management (cart, auth)
- **Axios** for API communication
- **TypeScript** for type safety
- **React Native** components for UI

## Custom Type Definitions

Custom type definitions have been created for the Medusa API interfaces to avoid direct dependencies on the Medusa SDK. These definitions can be found in `src/services/productService.ts`.

## Folder Structure Best Practices

This project follows a structured approach:

- Screens: All main screen components live in `src/screens/`
- Components: Reusable UI components are in `components/` and `src/components/`
- API: API client configuration and services are in `src/api/` and `src/services/`
- State: Global state management is in `src/state/`

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add some amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request 