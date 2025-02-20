# Stage 1: Build the Angular app
FROM node:latest

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# Stage 2: Serve the app with Nginx
FROM node:alpine
WORKDIR /app

COPY --from=build /app/dist/favorite-place-picker /usr/share/nginx/html

EXPOSE 4200

CMD ["npm", "start"]