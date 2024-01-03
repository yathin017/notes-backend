# notes-backend

## Technologies used
* Express - A minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. I chose Express for its simplicity, flexibility, and wide community support.
* MongoDB - A NoSQL database known for its scalability and flexibility. I used MongoDB because it allows us to store documents in a JSON-like format, making it a great choice for applications where data can evolve over time.
* Jest - A JavaScript Testing Framework with a focus on simplicity. It works out of the box for any React project and allows for easy testing of our application, ensuring code quality and reliability.

## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
* Node.js
* MongoDB

### Installing
1) Clone the repo:
```bash
git clone https://github.com/yathin017/notes-backend.git
```
2) Open directory
```bash
cd notes-backend
```
3) Install packages:
```bash
npm install
```
4) Create a `.env` file in the root directory and add the necessary environment variables
```bash
MONGODB_URI="your_mongodb_uri"
JWT_SECRET="your_jwt_secret"
```
5) Run the server
```bash
npm run dev
```

## Running Tests
Tests are located in the `__tests__` folder and are automatically detected by Jest
To run the test suite, use:
```bash
npm test
```
