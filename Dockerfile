FROM docker.io/library/node:16-alpine

WORKDIR /app

# copy everything
COPY . ./

# first do the build
RUN yarn --frozen-lockfile \
  && yarn build \
  && rm -rf ./node_modules/ ./apps/**/node_modules/

# then, install required modules for the runtime
RUN yarn global add yarn-deduplicate \
  && yarn --production --frozen-lockfile \
  && yarn global remove yarn-deduplicate

# some default environment variables
ENV APP_NAME="view-builder"
ENV PORT="8080"

EXPOSE 8080
CMD [ "/app/entrypoint.sh" ]
