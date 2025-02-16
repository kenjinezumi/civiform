# CiviForm

CiviForm is a **web-based form builder** and data collection tool inspired by solutions like **Kobo Toolbox**. It allows you to **create**, **deploy**, and **manage** forms with conditional logic, multiple question types, and a user-friendly interface.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Usage](#usage)
  - [Running the Frontend](#running-the-frontend)
  - [Running the Backend](#running-the-backend)
  - [Default Admin Credentials](#default-admin-credentials)
- [How to Create a New Form](#how-to-create-a-new-form)
- [Customization](#customization)
- [Future Enhancements](#future-enhancements)
- [License](#license)
- [Contact](#contact)

---

## Features

1. **Form Builder**  
   - Multiple question types (text, number, date, time, email, phone, rating, file upload, etc.).
   - Conditional skip logic to show/hide questions based on previous answers.
   - Required fields, placeholders, help text, and choice-based questions.

2. **User-Friendly UI**  
   - Modern React + MUI design.
   - Responsive layout for mobile and desktop.
   - Intuitive “accordion” UI for advanced settings.

3. **Public & Admin Views**  
   - Public links to fill out forms.
   - Admin dashboard for creating/editing forms, managing responses, etc.

4. **Authentication & Authorization**  
   - Basic login (JWT mock or custom logic).
   - Protected admin routes (only logged-in users can edit forms).

5. **Data Persistence**  
   - FastAPI backend with a recommended PostgreSQL database (or any SQL DB).
   - Docker-friendly setup for production deployments.

6. **Modular Architecture**  
   - Controller-Service-Repository pattern for both frontend and backend.
   - Easily extendable for advanced workflows, custom validations, or integrable with external systems.

---

## Tech Stack

**Frontend**  
- [React](https://reactjs.org/)  
- [TypeScript](https://www.typescriptlang.org/)  
- [Material UI (MUI)](https://mui.com/)  
- [React Router](https://reactrouter.com/)

**Backend**  
- [FastAPI (Python)](https://fastapi.tiangolo.com/)  
- [SQLAlchemy](https://www.sqlalchemy.org/) for ORM  
- [Poetry](https://python-poetry.org/) for dependency management  
- [JWT Authentication](https://jwt.io/) or session-based auth

**Database**  
- [PostgreSQL](https://www.postgresql.org/) recommended  
- Any SQL-compatible DB can be integrated

**Deployment**  
- [Docker](https://www.docker.com/) containers  
- [Docker Compose](https://docs.docker.com/compose/) for multi-container setups

---

---

## System Requirements

- **Node.js** (v14+ recommended)  
- **npm** or **yarn**  
- **Python 3.10+**  
- **Poetry**  
- (Optional) **Docker** + **Docker Compose** for containerized deployment

