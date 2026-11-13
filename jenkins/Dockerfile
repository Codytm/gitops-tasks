FROM node:22-bookworm AS nodebin

FROM jenkins/jenkins:lts-jdk21
USER root
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl git \
  && rm -rf /var/lib/apt/lists/*
COPY --from=nodebin /usr/local/bin/node /usr/local/bin/node
COPY --from=nodebin /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
  && ln -sf /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx
ARG DOCKER_CLI_VERSION=27.5.1
RUN arch="$(dpkg --print-architecture)" \
  && case "$arch" in \
       arm64) docker_arch=aarch64 ;; \
       amd64) docker_arch=x86_64 ;; \
       *) echo "unsupported architecture: $arch" && exit 1 ;; \
     esac \
  && curl -fsSL "https://download.docker.com/linux/static/stable/${docker_arch}/docker-${DOCKER_CLI_VERSION}.tgz" \
    | tar -xz -C /usr/local/bin --strip-components=1 docker/docker
RUN jenkins-plugin-cli --plugins "workflow-aggregator git credentials-binding"
COPY init.groovy.d/ /usr/share/jenkins/ref/init.groovy.d/
USER jenkins
ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"
