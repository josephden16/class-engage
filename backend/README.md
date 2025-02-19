# Clisha Review Backend

## Project setup

### Prerequisites:

- [Node.js](https://nodejs.org/en/) (v18.x or higher)
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/) (Used Locally)

### Installation

Follow these steps to install the project:

Clone the repository:

```bash
git clone https://dev.azure.com/VQualis/Clisha%20Review/_git/clisha-review-backend
cd clisha-review-backend
```

Install dependencies:

```bash
pnpm install # please make sure to use `pnpm` for installations
```

Set up environment variables:

```bash
cp .env.example .env # update the `.env` file accoridingly
```

Start the services (Postgres and Redis):

```bash
npm run services:dev:start
```

Generate the Prisma client (run this after every schema change):

```bash
npm run prisma:generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

Start the development server:

```bash
npm run start:dev
```

## Tech Stack

- **Node.js**: JavaScript runtime environment.
- **NestJS**: Backend framework for building scalable and maintainable APIs.
- **TypeScript**: Superset of JavaScript that adds static typing.
- **PostgreSQL**: SQL-based relational database.
- **Redis**: Key-Value data store and cache
- **Prisma**: ORM for database interactions, used to manage database schemas and queries.
- **Zod**: TypeScript-first schema declaration and validation library for API request validation.
- **Docker**: Containerization technology used for running the database and other services.

## Commands

Here’s a list of commands available in the project:

**Install dependencies**:

```bash
npm install
```

**Start the development server**:

```bash
npm run start:dev
```

**Run Prisma Studio** (view and manage your database):

```bash
npm run prisma:studio
```

**Generate Prisma Client**:

```bash
npm run prisma:generate
```

**Run database migrations**:

```bash
npx prisma migrate dev
```

**Start the Postgres and Redis containers**:

```bash
npm run services:dev:start
```

**Stop the Postgres and Redis containers**:

```bash
npm run services:dev:stop
```

**Restart the Postgres and Redis containers**:

```bash
npm run services:dev:restart
```

**Stop and remove the Postgres container**:

```bash
npm run db:dev:stop
```

**Start the Postgres container**:

```bash
npm run db:dev:start
```

**Restart the Postgres container and apply migrations**:

```bash
npm run db:dev:restart
```

**Run linter**:

```bash
npm run lint
```

**Run tests**:

```bash
npm run test
```
