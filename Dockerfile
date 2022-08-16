FROM node:16-bullseye-slim

WORKDIR /app

# Install dependencies
COPY ./package.json /app/
COPY ./package-lock.json /app/
RUN npm install --omit=dev

# Run the app
COPY ./index.js /app/
CMD ["npm", "run", "start"]
