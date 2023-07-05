FROM node:12.16.3

WORKDIR /code

ENV PORT 5000

ENV NODE_ENV development

ENV MONGO_URI mongodb://localhost:27017/bootcamp

ENV GEOCODER_PROVIDER  google

ENV GEOCODER_API_KEY   

ENV FILE_UPLOAD_PATH  ./public/uploads

ENV MAX_FILE_UPLOAD  1000000

ENV JWT_SECRET  

ENV JWT_EXPIRE 30d

ENV JWT_COOKIE_EXPIRE  30

ENV SMTP_HOST  smtp.mailtrap.io

ENV SMTP_PORT 2525

ENV SMPT_EMAIL  

ENV SMTP_PASSWORD  

ENV FROM  noreply@bootcamper.io

ENV FROM_NAME Bootcamper

COPY package.json /code/package.json

RUN npm install

COPY . /code/

CMD [ "node","server.js" ]

