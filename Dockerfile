FROM node

RUN apt-get update
WORKDIR usr/src/
RUN git clone https://github.com/codethesouth/trolleyTracking
WORKDIR trolleyTracker/
RUN npm install
ENV port 80
RUN node hsvtt.js

EXPOSE 80
