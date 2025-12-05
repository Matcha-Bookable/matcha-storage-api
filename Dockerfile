FROM node:lts-alpine

WORKDIR /app
COPY package*.json ./

RUN npm install --production

COPY . .

ENV MONGO_URI=""
ENV R2_LOG_BUCKET=""
ENV R2_DEMO_BUCKET=""
ENV R2_ACCOUNT_ID=""
ENV R2_ACCESS_KEY_ID=""
ENV R2_SECRET_ACCESS_KEY=""

EXPOSE 8080

CMD ["npm", "start"]