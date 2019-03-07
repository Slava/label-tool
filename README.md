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

## Config

The following environment variables can be tweaked:

- `PORT` - the part the app is served on (dev, prod)
- `API_PORT` - to differentiate the port for the API to run on (should be only used in dev)
- `UPLOADS_PATH` - absolute path where the app stores uploaded images, defaults to server's folder 'uploads'
- `DATABASE_FILE_PATH` - absolute path of the file where the app stores the SQLite data. Defaults to `database.sqlite` in the server folder

## Run in Docker

The default `Dockerfile` points to `/uploads` and `/db/db.sqlite` for persisted data, make sure to prepare those in advance to be mounted over. Here is an example mounting a local host directory:

```bash
mkdir ~/containersmnt/
mkdir ~/containersmnt/db/
mkdir ~/containersmnt/uploads/
cd server
DATABASE_FILE_PATH=~/containersmnt/db/db.sqlite yarn run resetdb
cd ..
```

Now build the container:

```bash
docker build -t imslavko/image-labeling-tool .
```

Run attaching the mounts:

```bash
docker run -p 5000:3000 -v ~/containersmnt/uploads:/uploads -v ~/containersmnt/db:/db -d imslavko/image-labeling-tool
```

Access the site at `localhost:5000`.
