FROM alpine
RUN apk add --update nodejs
RUN apk add tzdata
RUN cp /usr/share/zoneinfo/Australia/Melbourne /etc/localtime
RUN echo 'Australia/Melbourne' > /etc/timezone

#FROM ubuntu:latest
#RUN apt-get -y update && apt-get install -y nodejs npm
#RUN echo 'Australia/Melbourne' > /etc/timezone
#RUN dpkg-reconfigure -f noninteractive tzdata

WORKDIR /tmp

ADD package.json /tmp/
RUN npm install

ADD . /tmp/

#CMD nodejs ./src/app.js ./config/inputs/production.json ./config/outputs/ci.json ./config/options/runonce.json
CMD node ./src/app.js ./config/inputs/production.json ./config/outputs/ci.json ./config/options/runonce.json ./aws-credentials.json
