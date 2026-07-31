# 🌟 Aster — Academic Workspace

**Aster** is a sleek, dark-themed academic management platform designed for students. It combines a smart assignment calendar with natural language input, course management, and a focused task sidebar to keep your academic life organized.

---

## ✨ Features

- 📅 **Academic Calendar** — Full Month and Week views powered by FullCalendar
- 🗣️ **Natural Language Assignment Input** — Type assignments in plain English and Aster parses due dates, times, and course info automatically
- ✅ **Assignment Completion Tracking** — Mark assignments complete with a confirmation modal; completed items show a ✓ checkmark on the calendar
- 🎯 **Assignment Focus Panel** — Chronological sidebar showing upcoming assignments with a "Next Up" badge; collapsible for full-width calendar mode
- 🏫 **Course Management** — Add courses with custom colors that pill-badge every assignment on the calendar
- 🗂️ **Collapsible Navigation Sidebar** — Icon-only collapsed mode; click the logo to re-expand
- 🔔 **Custom Confirmation Dialogs** — Dark-themed modals for complete, undo, and delete actions (no browser alerts)
- ⚙️ **Workspace Settings** — Configure assignment focus limit, default due times, semester dates, and more
- 🔐 **JWT Authentication** — Secure login and registration

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Angular 17, Tailwind CSS, FullCalendar, Angular Material |
| **Backend** | .NET 8, ASP.NET Core Web API, Entity Framework Core |
| **Database** | SQL Server (via EF Core migrations) |
| **Auth** | JWT Bearer Tokens |
| **AI Parsing** | Azure OpenAI (natural language assignment extraction) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 20.9.0
- .NET 8 SDK
- SQL Server (local or remote)

### Backend Setup

```bash
cd Aster.Api

# Update connection string in appsettings.json
# Then run migrations:
dotnet ef database update

# Start the API
dotnet run --urls "http://localhost:5000"
```

### Frontend Setup

```bash
cd aster-ui
npm install
npx ng serve --port 4205 --proxy-config proxy.conf.json
```

Open **http://localhost:4205** in your browser.

---

## 📁 Project Structure

```
Aster/
├── Aster.Api/                  # .NET 8 Web API backend
│   ├── Controllers/            # REST API endpoints
│   ├── Data/                   # EF Core DbContext & Migrations
│   ├── Models/                 # Entities & DTOs
│   └── Services/               # JWT, NLP Parser
└── aster-ui/                   # Angular 17 frontend
    └── src/app/
        ├── pages/              # Dashboard, Classes, Settings, Auth
        ├── components/         # Reusable components (Confirmation Dialog)
        ├── layout/             # Sidebar Navigation
        └── services/           # API service layer
```

---

## 📸 Screenshots

> Calendar, Assignment Focus, and Course Management views available after running locally.

---

## 📄 License

MIT
