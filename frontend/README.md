# Inventory Management System

A full-stack inventory management application built with Django REST Framework, React, and PostgreSQL.

## Features

- JWT-based user authentication
- Role-based access control (Admin, Manager, Staff)
- Product management
- Category management
- Supplier management
- Stock In, Stock Out, and Stock Adjustment
- Stock transaction history
- Low-stock monitoring
- Dashboard with inventory statistics
- Search, filtering, and pagination
- REST API documentation with Swagger

## Technology Stack

**Backend**
- Python
- Django
- Django REST Framework
- Simple JWT
- PostgreSQL

**Frontend**
- React
- JavaScript
- React Router
- Axios
- HTML and CSS

**Tools**
- Git and GitHub
- VS Code
- Swagger / OpenAPI

## Project Structure

```text
inventory-management/
├── backend/
│   ├── config/
│   ├── accounts/
│   ├── inventory/
│   ├── suppliers/
│   └── manage.py
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Local Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd inventory-management
```

### 2. Configure the backend

Create and activate a Python virtual environment. Install the backend dependencies:

```bash
pip install django djangorestframework django-cors-headers django-filter "psycopg[binary]" djangorestframework-simplejwt python-dotenv drf-spectacular
```

Create your private `.env` file using `.env.example` as a template and configure PostgreSQL.

Run migrations:

```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend: `http://127.0.0.1:8000/`

### 3. Configure the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173/`

### 4. API Documentation

When the backend is running:

- Swagger: `http://127.0.0.1:8000/api/docs/`
- ReDoc: `http://127.0.0.1:8000/api/redoc/`

## Main API Endpoints

| Endpoint | Purpose |
|---|---|
| `/api/token/` | Obtain JWT tokens |
| `/api/token/refresh/` | Refresh access token |
| `/api/auth/register/` | User registration |
| `/api/auth/profile/` | User profile |
| `/api/products/` | Product management |
| `/api/categories/` | Category management |
| `/api/suppliers/` | Supplier management |
| `/api/transactions/` | Stock transactions |
| `/api/products/low-stock/` | Low-stock products |
| `/api/dashboard/summary/` | Dashboard statistics |

## Security

- JWT authentication
- Role-based permissions
- Environment-based database configuration
- Stock updates handled through backend business logic
- Transaction history protected from modification and deletion through the API

## Future Improvements

- Automated tests
- Advanced reporting and analytics
- Email notifications for low stock
- Production deployment and monitoring

## Author

Developed as a Python Full Stack Development project.