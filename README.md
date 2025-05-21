# 🧠 CruxPad – AI-Powered Cheatsheet Generator

![React](https://img.shields.io/badge/React-2024-blue.svg?logo=react)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg?logo=next.js)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-38B2AC.svg?logo=tailwind-css)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Status](https://img.shields.io/badge/status-active-brightgreen)

CruxPad is your intelligent personal study assistant. Upload PDFs or plain text files, and CruxPad will generate slightly detailed, organized cheatsheets using Google's Gemini API — ideal for revision, productivity, and staying focused.

With a minimalist UI, dark mode support, structured export options, and real-time feedback, CruxPad helps turn raw documents into structured, revision-friendly content in seconds.

---

## 📚 Table of Contents

- [✨ Features](#-features)
- [📸 Screenshots](#-screenshots)
- [🚀 Getting Started](#-getting-started)
  - [🔧 Prerequisites](#-prerequisites)
  - [📦 Installation](#-installation)
  - [🧪 Running Locally](#-running-locally)
  - [🔐 Environment Variables](#-environment-variables)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [📤 Export Formats](#-export-formats)
- [🧩 Roadmap](#-roadmap)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)

---

## ✨ Features

- 📂 **Upload Support**: Accepts `.pdf` and `.txt` file uploads.
- 🔍 **Text Extraction**: Uses PDF.js to extract and clean raw text from documents.
- 🤖 **AI Integration**: Sends extracted text to Gemini API to create structured, slightly detailed cheatsheets.
- 🧾 **Smart Output Formatting**:
  - Grouped by headings/subheadings
  - Short explanations (1-2 sentences)
  - Bulleted or numbered key points
- 🌓 **Dark Mode Support**: Automatically detects or toggles based on user/system preference.
- 💾 **Export Options**:
  - Plain `.txt` file
  - Stylized, multi-column `.pdf` file using jsPDF
- 🧯 **Robust Error Handling**: Uses `react-error-boundary` for safe rendering and user-friendly fallback UIs.

---

## 📸 Screenshots

> _Coming soon!_

- Upload Interface
- Generated Cheatsheet View
- Export Options (Text + PDF)
- Dark Mode UI

---

## 🚀 Getting Started

### 🔧 Prerequisites

- Node.js `>= 18.x`
- npm or yarn
- A [Gemini API key](https://ai.google.dev/)

### 📦 Installation

```bash
git clone https://github.com/yourusername/cruxpad.git
cd cruxpad
npm install
```

### 🧪 Running Locally

```bash
npm run dev
```
Visit http://localhost:3000 in your browser.

### 🔐 Environment Variables
Create a .env.local file:

```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
```
### Made with ❤️ by Anish – turning content into clarity.
