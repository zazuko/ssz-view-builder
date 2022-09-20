FROM docker.io/library/node:18-alpine

# fix "error:0308010C:digital envelope routines::unsupported" error during build
ENV NODE_OPTIONS="--openssl-legacy-provider"

WORKDIR /app

# install dependencies
COPY package.json yarn.lock ./
RUN yarn

# copy all other files and run the build
COPY . ./
RUN yarn build

# some default environment variables
ENV APP_NAME="view-builder"
ENV PORT="8080"

EXPOSE 8080
CMD [ "/app/entrypoint.sh" ]
