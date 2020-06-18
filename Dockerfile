# nodejs image
FROM node:12.6.0

ADD package.json /tmp/package.json
RUN cd /tmp && npm install && npm install -g react-scripts
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/

WORKDIR /opt/app
ADD . /opt/app
CMD npm start
EXPOSE 3000