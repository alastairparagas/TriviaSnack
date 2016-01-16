FROM: node:5.4.1
MAINTAINER: "Alastair Paragas <alastairparagas@gmail.com>"

EXPOSE 8000
RUN apt-get update -y
RUN apt-get install libxml2-dev -y
ADD . /app/

WORKDIR /app
RUN node index.js