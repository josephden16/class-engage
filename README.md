# ClassEngage

ClassEngage is an interactive classroom engagement application designed to enhance live sessions between lecturers and students. It supports features like real-time question answering, student Q&A with upvoting, and post-session analytics.

## Project Structure

- **Backend**: Located in `./backend`, built with Nest.js and Prisma for API and database management.
- **Frontend**: Located in `./frontend`, built with Next.js for a responsive user interface.

## Prerequisites

- **Node.js**: Version 18.x or higher (v22.14.0 tested).
- **pnpm**: Package manager for installing dependencies (npm can also be used).
- **Git**: For cloning the repository.
- **Docker**: For running PostgreSQL and Redis

## Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/josephden16/class-engage.git
   cd class-engage
   ```

2. **Install Root Dependencies**:

   ```bash
   npm install
   ```

3. **Install Backend Dependencies**:

   ```bash
   npm run backend:install
   ```

4. **Install Frontend Dependencies**:

   ```bash
   npm run frontend:install
   ```

5. **Set Up Environment Variables**:

   - Create a `.env` file in `./backend` using the example .env file `.env.example`
   - Create a `.env` file in `./frontend` using the example .env file `.env.example`

6. **Initialize the Database**:
   - Run migrations in the backend folder:
     ```bash
     cd backend
     npx prisma migrate dev
     ```

## Running the Application

### Development Mode

Firstly, ensure the services powering the backend are running:

```bash
npm run backend:services
```

Start both backend and frontend concurrently:

```bash
npm run dev
```

- Backend runs on `http://localhost:5000` (port will be based on what's in `.env`).
- Frontend runs on `http://localhost:3000` (port will be based on what's in `.env`).

### Individual Development

- **Backend Only**:
  ```bash
  npm run backend:dev
  ```
- **Frontend Only**:
  ```bash
  npm run frontend:dev
  ```

### Production Build

- **Build Backend**:
  ```bash
  npm run backend:build
  ```
- **Build Frontend**:
  ```bash
  npm run frontend:build
  ```

## Features

- **Live Sessions**: Lecturers can create sessions with questions; students join via an invitation code.
- **Real-Time Interaction**: Students answer questions and ask their own, with upvoting support.
- **Analytics**: Post-session analytics for lecturers, including response rates and poll results.
- **Responsive UI**: Built with Next.js and Shadcn UI components.

## Scripts

- `dev`: Runs backend and frontend in development mode concurrently.
- `frontend:dev`: Starts the frontend development server.
- `backend:dev`: Starts the backend development server.
- `frontend:build`: Builds the frontend for production.
- `backend:build`: Builds the backend for production.
- `frontend:install`: Installs frontend dependencies.
- `backend:install`: Installs backend dependencies.

## Repository

- **GitHub**: [https://github.com/josephden16/class-engage](https://github.com/josephden16/class-engage)
- **Issues**: Report bugs at [https://github.com/josephden16/class-engage/issues](https://github.com/josephden16/class-engage/issues)

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please fork the repository, create a feature branch, and submit a pull request.
