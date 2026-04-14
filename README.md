# Server Monitoring Dashboard

This is a full-stack MERN application for monitoring servers. It includes authentication, server CRUD features, and a dashboard with simulated monitoring metrics.

## Prerequisites

- Node.js **25**
- MongoDB database
- A terminal or command line tool

## Local Setup

### 1) Clone the project
Download the project to your local machine and open the project root folder in your terminal.

### 2) Set up the backend
Go to the backend folder:

```bash
cd backend
```

Create a `.env` file in the `backend` directory and add the following values:

```env
MONGO_URI=<YOUR_MONGO_URI>
JWT_SECRET=<YOUR_JWT_SECRET>
PORT=5001
```

Replace the values in angle brackets with your own configuration, then save the file.

### 3) Install dependencies
Install the backend and frontend dependencies from the project root:

```bash
cd backend
npm ci
cd ../frontend
npm ci
cd ..
npm ci
```

### 4) Start the project
Run the application from the project root:

```bash
npm start
```

## Public URL

The public URL of the deployed project is:

[http://13.236.183.73:3000/](http://13.236.183.73:3000/)

> Note: the server may be powered off from time to time. After a restart, the public IPv4 address may change. The link above is the last confirmed working address.

## Demo Credentials

Use the following account to access the dashboard:

- **Email:** `user@test.com`
- **Password:** `jywris-8cepto`

## Project Notes

- Server dashboard metrics are simulated/dummy values in this assessment stage.
- The project is organized as a split MERN monorepo with separate `backend/` and `frontend/` applications.
