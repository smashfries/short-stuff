# About

Welcome to **Short Stuff**. This is a URL shortener service that allows users to quickly shorten URLs, as well as add custom URLs and track performance/analytics with a dedicated account. We also have a developer rest API, with plans for GraphQL also, for other apps and businesses to integrate and access our URL Shortener for their custom needs.

# Getting Started

The app is currently under development. If you wish to get started with a local copy, you can continue by forking the repository to your own account, cloning the repository to your system, running `npm install` to install the dependencies, then running the `start` or `dev` script to get the server running. Before that, create a file called `.env` in the root of the project directory. Add the URI to your local or development MongoDB database. Make sure to set the `MONGODB_URI` variable in that file like below:

```
MONGODB_URI=mongodb://localhost/test
```

Then run the one of the following commands to start the server.

```
npm run start
```

or the following for nodemon to watch and re-start the server when the files change

```
npm run dev
```

# Developing

This project uses Node.js, Express, MongoDB and EJS (templates) to function. Make sure to update the .env file with the connection URL to your own local test MongoDB database.

# Contributing

Everyone is welcome to submitting issues, feedback, suggestions, improvements, as well as submitting pull requests. Send me a message via twitter or email (check my GitHub profile) and I would love to reach out and onboard you.
