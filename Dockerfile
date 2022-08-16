FROM docker.io/library/node:18-alpine AS builder

# fix "error:0308010C:digital envelope routines::unsupported" error during build
ENV NODE_OPTIONS="--openssl-legacy-provider"

WORKDIR /app

# install dependencies
COPY package.json yarn.lock ./
RUN yarn

# copy all other files and run the build
COPY . ./
RUN yarn build

# serve the static build using nginx
FROM docker.io/library/nginx:1.23-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
