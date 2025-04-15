# Home Energy Monitoring Dashboard

An interactive web application for monitoring and analyzing home energy consumption patterns with detailed visualizations and analytics.

## Getting Started

### Prerequisites

- Node.js (latest LTS version recommended)
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd energyGraphs
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

The application will be available at `http://localhost:3000/energyGraphs`

### Building for Production

To create a production build:

```bash
npm run build
```

## Project Structure

- `/src`
  - `/components` - React components for different visualizations
  - `App.js` - Main application component
  - `index.js` - Application entry point

## Technology Stack

- React.js
- React Router for navigation
- Tailwind CSS for styling
- Various data visualization libraries

## Features

- **Daily Power Consumption**: Track your daily energy usage patterns
- **Room-wise Analysis**: Breakdown of energy consumption by different rooms
- **Device-level Monitoring**: Detailed power consumption for individual devices
- **Weekly Comparisons**: Compare energy usage across different weeks
- **Control Point Analysis**: Advanced analysis of energy control points
- **Usage Heatmap**: Visualize energy usage patterns through heat maps
- **Monthly Trends**: Track and analyze monthly consumption patterns
- **Anomaly Detection**: Identify unusual energy consumption patterns
- **Network Timeline**: Chronological view of device energy usage