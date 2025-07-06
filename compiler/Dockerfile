FROM node:22-alpine
WORKDIR /app
RUN apk update && apk add --no-cache \
  g++ \
  gcc \
  python3 \
  openjdk11-jre \
  openjdk11-jdk \
  go \
  rust \
  php \
  ruby
COPY . .
RUN npm install
EXPOSE 3001
CMD ["npm", "run", "start"]
