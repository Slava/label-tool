FROM node:10.15.2

WORKDIR /app
COPY . .
RUN yarn install
RUN cd client && yarn install
RUN cd server && yarn install
RUN cd client && yarn build

ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server/src/index.js"]
