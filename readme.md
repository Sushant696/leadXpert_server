# LeadXpert Server

Backend API for **LeadXpert**, a smart lead management system built to support web and mobile clients from a single, scalable backend.

**Note**
This repository contains the **backend only**.

LeadXpert was originally developed inside a monorepo and later split for better maintainability.

Client applications using this API:

- 🌐 **Web App (Next.js)**
  https://github.com/Sushant696/leadxpert_web

- 📱 **Mobile App (Flutter)**
  https://github.com/Sushant696/leadxpert

---

## Tech Stack

- Node.js (18+)

- TypeScript

- Express

- MongoDB (Replica Set)

- Mongoose

- Docker & Docker Compose

---

## Quick Start

### Using Docker Compose (Recommended)

1. Clone the repository:

```bash

git clone

```

2. Copy environment variables:

```bash

cp .env.example .env

```

3. Start MongoDB with Docker Compose:

```bash

docker-compose up -d

```

4. Install dependencies:

```bash

npm install

```

5. Run the application:

```bash

npm run dev

```

The API will be available at `http://localhost:5500`

### Stop Services

```bash

docker-compose down

```

### Remove All Data (Fresh Start)

```bash

docker-compose down -v

```

## Database

- MongoDB runs as a single-node replica set (required for transactions)

- Data persists in Docker volume `mongodb_data`

## Development

```bash

npm run dev # Start development server

npm run build # Build for production

npm start # Run production server

```
