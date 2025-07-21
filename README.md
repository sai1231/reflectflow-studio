# Firebase Studio - ReflectFlow Extension Prototype

This is a Next.js project that serves as a development environment for the UI of the **ReflectFlow** browser extension.

## How to Use This Prototype

1.  **Main Application (`/`)**: This is a mock webpage used as a target for testing recording functionality.
2.  **Extension Popup UI (`/popup`)**: The page at `/popup` renders the `ReflectFlowPanel` component. This is the UI that will appear when you click the browser extension's icon. You can develop and test the popup's appearance and functionality here in isolation.

## Next Steps: Creating the Browser Extension

This project contains the React components and logic for the extension's UI. To create the actual extension, you will need to set up a new project (e.g., using a tool like Vite) and copy the components from this project into it.

A template for the extension's manifest file has been created for you at `/public/manifest.template.json`. You can use this as a starting point for your new extension project.
