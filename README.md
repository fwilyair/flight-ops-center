# ✈️ Flight Operations Center (SAGS)

![Thumbnail](./public/thumbnail.png) <!-- 你可以在这里替换成项目的真实截图 -->

A high-fidelity, production-grade flight operations management dashboard built with React, focusing on intuitive data visualization and real-time Gantt chart timeline tracking. Designed with a sleek, modern light-theme UI and advanced interactions to elevate the flight dispatching experience.

## ✨ Features

- **📊 Dynamic Gantt Chart Timeline**: Interactive, scalable timeline (from hours to minutes) visualizing flight milestones, processes, and statuses.
- **🪪 Detailed Flight Cards**: Comprehensive flight information displays, including flight numbers, aircraft types, parking stands, delays, and dynamic tag badges (with ellipsis and hover-tooltips for overflow tags).
- **🟢 Real-time Process Markers**: Interactive diamond markers on the "放行" (Release) baseline tracking real-time status (Arrival in Green, Departure in Blue) with smart anti-overlap positioning.
- **🏷️ Smart Tag System**: Color-coded badges for flight attributes with graceful degradation for space constraints.
- **🎨 Premium Light Theme UI**: Beautifully crafted interface using Tailwind CSS, featuring subtle shadows, glassmorphic elements, modern typography, and smooth micro-animations.
- **🛠️ Extensible Architecture**: Clean component-based architecture (React) designed for easy integration with robust backend services and real-time data queues (MQ).

## 🚀 Tech Stack

- **Frontend Framework**: React 18, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Typography**: Modern Sans-Serif stack (optimized for readability and premium feel)
- **Language**: TypeScript

## 📦 Getting Started

### Prerequisites

- Node.js (v16.0 or higher)
- npm or yarn or pnpm

### Installation

1. Clone the repository:

   ```bash
   git clone <your-repo-url>
   ```

2. Navigate to the project directory:

   ```bash
   cd flight-ops-center
   ```

3. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open your browser and visit `http://localhost:3000` (or the port specified by Vite in your terminal).

## 📐 Architecture & Components

Main components located in `/components/`:

- `GanttRow.tsx`: The core component rendering the flight data card and its timeline tracking points.
- `AnnotationLine.tsx`: Renders the baselines and dynamic process markers.
- `FlightDetailPanel.tsx`: A robust layout panel for organizing flight details elegantly.
- `Header.tsx`: System header with real-time clock, legends, and timescale controls.

Data definitions and static mocks are maintained in `/data.ts`.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check [issues page](<your-issues-url>).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
