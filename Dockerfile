FROM hypriot/rpi-node:boron as base

WORKDIR /usr/app

COPY . .

FROM base AS dependencies

RUN npm install --silent --only=production
RUN cp -R node_modules prod_node_modules
RUN npm install

FROM dependencies AS compile

COPY --from=dependencies /usr/app/prod_node_modules ./node_modules
COPY src src
RUN npm run prepare
# RUN npm run test

EXPOSE 8080