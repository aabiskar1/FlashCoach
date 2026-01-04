# Flash Coach

> "Flash Coach" – because it uses **Gemini Flash** and your flash might be on the wrong key!

**Flash Coach** is a Node.js CLI tool that acts as your personal League of Legends coach. It fetches your recent match history using the Riot Games API, compacts the data, and uses Google's Gemini 3 Flash AI to analyze your performance, playstyle, and suggest improvements.

## Features

-   **Match Analysis**: Fetches your last 30 matches.
-   **AI Coaching**: Generates a personalized "Coaching Report" using Gemini AI.
-   **Playstyle Profiling**: Identifies if you are an "Aggressive Lane Bully", "Passive Scaler", etc.
-   **Champion Suggestions**: Recommends champions based on your actual performance.
-   **Efficiency**: Compacts match data to minimized token usage for the AI.

## Prerequisites

-   [Node.js](https://nodejs.org/) (v16 or higher)
-   A Riot Games API Key (Get it from [developer.riotgames.com](https://developer.riotgames.com/))
-   A Google Gemini API Key (Get it from [aistudio.google.com](https://aistudio.google.com/))

## Installation

1.  **Clone or download** this repository.
2.  **Install dependencies**:
    ```bash
    npm install
    ```

## Configuration

1.  Create a `.env` file in the root directory (you can copy `.env.example`).
2.  Add your API keys:

    ```env
    RIOT_API_KEY=RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    GEMINI_API_KEY=AIzaSy...
    ```

    > **Note**: Riot Development API keys expire every 24 hours. If you get a 403 error, regenerate your key.

## Usage

1.  **Build the project** (compiles TypeScript to JavaScript):
    ```bash
    npm run build
    ```

2.  **Run the tool**:
    ```bash
    npm start
    ```

3.  **Follow the prompts**:
    -   Enter your **Game Name** (e.g., `Faker`)
    -   Enter your **Tag Line** (e.g., `T1`)

    The tool will fetch your data and output the AI coaching report.

## Development

-   **Modify Logic**: Edit files in `src/`.
-   **Update Types**: Edit `src/utils/types.ts` (uses Zod for validation).
-   **Rebuild**: Always run `npm run build` after making changes.
