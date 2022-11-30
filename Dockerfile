FROM docker.io/library/node:16-alpine

WORKDIR /app

# copy everything
COPY . ./

RUN apk add --no-cache gettext

# first do the build
RUN yarn --frozen-lockfile \
  && yarn build \
  && rm -rf ./node_modules/ ./apps/**/node_modules/ \
  && yarn cache clean

# then, install required modules for the runtime
RUN yarn global add yarn-deduplicate json \
  && yarn --production --frozen-lockfile \
  && yarn global remove yarn-deduplicate \
  && yarn cache clean

# some default environment variables
ENV APP_NAME="view-builder"
ENV PORT="8080"

# build with `docker build --build-arg COMMIT=$(git rev-parse HEAD)`
ARG COMMIT
ENV SENTRY_RELEASE=ssz-view-builder@$COMMIT

EXPOSE 8080
CMD [ "/app/entrypoint.sh" ]
