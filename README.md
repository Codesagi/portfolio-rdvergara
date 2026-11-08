# Raynard AI Portfolio

React + Vite + TypeScript portfolio with an AI assistant. Static, GitHub Pages ready, no paid APIs or keys.

## Run locally
npm install
npm run dev

## Deploy to GitHub Pages
1. Push this project to the main branch of a GitHub repository.
2. Repository Settings > Pages > Source: GitHub Actions.
3. The included workflow builds and publishes on every push. Site URL: https://USERNAME.github.io/REPO/

## Content
All content and assistant knowledge comes from src/data/raynard-profile.json. Review every null value and note before publishing.

## Assistant
- Default: keyword and topic-based knowledge assistant (src/services/knowledge-retrieval, src/services/assistant). It is not an LLM.
- Optional: on-device model via WebLLM (src/services/local-ai). Needs WebGPU, downloads about 880 MB only after the visitor agrees, runs in a Web Worker, and falls back to the knowledge assistant on any failure.
