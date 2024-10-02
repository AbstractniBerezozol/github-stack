FROM node:18-alpine 
WORKDIR "/apps"

RUN npm global add typescript

COPY ./package.json ./
COPY ./ package-lock.json ./

RUN npm install

COPY . .

CMD [ "npm", "server" ]