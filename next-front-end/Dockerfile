FROM node:24-alpine
RUN apk add --no-cache bash
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
EXPOSE 3000
CMD ["npm", "dev"]
