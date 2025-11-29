# Grocermator

Grocermator is a smart, client-side grocery planning application designed to minimize food waste. It helps you manage recipes, generate optimized meal plans that prioritize perishable ingredients, and create efficient shopping lists.

## Features

- **Smart Meal Planning**: Generates plans that prioritize perishable ingredients and group recipes with shared ingredients to minimize waste.
- **Recipe Management**: Add, edit, and delete recipes with support for fractional quantities, instructions, and images.
- **Shopping List**: Automatically aggregates ingredients from your meal plan.
- **PWA Support**: Installable on mobile/desktop and works offline.
- **Data Privacy**: All data is stored locally in your browser. Import/Export functionality allows for backups.

## Running Locally

To run the application on your local machine:

1. **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd grocermator
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Start the development server**:

    ```bash
    npm run dev
    ```

4. **Open in browser**:
    Navigate to `http://localhost:5173` (or the URL shown in your terminal).

## Deployment

This application is designed to be deployed to **GitHub Pages**.

### Automatic Deployment (Script)

We have provided a convenience script to deploy directly to GitHub Pages.

1. **Run the deploy script**:

    ```bash
    npm run deploy
    ```

    *Note: This script builds the project and pushes the `dist` folder to the `gh-pages` branch of your repository.*

### Manual Deployment

If you prefer to deploy manually:

1. **Build the project**:

    ```bash
    npm run build
    ```

2. **Deploy the `dist` folder**:
    Push the contents of the `dist` folder to your hosting provider (e.g., GitHub Pages, Netlify, Vercel).

## PWA Notes

This app is a Progressive Web App (PWA).

- **Icons**: App icons are located in `public/`.
- **Manifest**: Configuration is in `vite.config.ts`.
- **Offline**: Service worker is generated at build time.
