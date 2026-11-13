#!/bin/sh
# Build and start the local Jenkins controller. GitHub and admin secrets stay
# in the environment and in ~/.config/gitops-tasks; they are not written to git.
set -eu

root="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
config_dir="${HOME}/.config/gitops-tasks"
password_file="${config_dir}/jenkins-admin-password"
mkdir -p "${config_dir}"
chmod 700 "${config_dir}"

if [ ! -f "${password_file}" ]; then
  umask 077
  openssl rand -base64 24 | tr -d '\n' > "${password_file}"
fi
chmod 600 "${password_file}"

github_user="$(gh api user --jq .login)"
github_token="$(gh auth token)"
sock_gid="$(stat -f '%g' "${HOME}/.docker/run/docker.sock")"

docker build -t gitops-tasks-jenkins:local -f "${root}/jenkins/Dockerfile" "${root}/jenkins"

if docker inspect jenkins >/dev/null 2>&1; then
  docker rm -f jenkins >/dev/null
fi

docker run -d --name jenkins --restart=unless-stopped \
  -p 127.0.0.1:8081:8080 \
  -p 127.0.0.1:50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v "${HOME}/.docker/run/docker.sock:/var/run/docker.sock" \
  --group-add "${sock_gid}" \
  -e "JENKINS_ADMIN_PASSWORD=$(cat "${password_file}")" \
  -e "GITHUB_USER=${github_user}" \
  -e "GITHUB_TOKEN=${github_token}" \
  gitops-tasks-jenkins:local

echo "Jenkins is starting at http://127.0.0.1:8081"
echo "Admin user: admin"
echo "Admin password file: ${password_file}"
