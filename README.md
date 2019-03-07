# Image Labeling App

## Development

Install npm packages for client, server and the top-level folder:

```bash
yarn install
cd server && yarn install && cd ..
cd client && yarn install && cd ..
```

Run server migrations to setup the database:

```bash
cd server && yarn run resetdb && cd ..
```

Run in the development mode:

```bash
env PORT=3000 API_PORT=3001 yarn start
```

## Build For Production

Build the client app:

```bash
cd client && yarn run build && cd ..
```

Now you can run the server app in prod mode serving the client build:

```bash
env PORT=80 NODE_ENV=production node server/src/index.js
```
