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
env PORT=3000 API_PORT=3001 yarn run
```

## Deployment

...
