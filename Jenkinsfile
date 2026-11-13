pipeline {
  agent any
  environment {
    REGISTRY = 'localhost:5001'
    IMAGE_NAME = 'tasks-api'
  }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
        script {
          env.SHORT_SHA = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
          env.COMMIT_MSG = sh(script: 'git log -1 --pretty=%s', returnStdout: true).trim()
        }
      }
    }
    stage('Test') {
      when {
        not { expression { env.COMMIT_MSG.contains('[skip ci]') } }
      }
      steps {
        sh 'npm ci'
        sh 'npm test'
      }
    }
    stage('Build and push') {
      when {
        not { expression { env.COMMIT_MSG.contains('[skip ci]') } }
      }
      steps {
        sh '''
          set -eu
          docker build -t "${REGISTRY}/${IMAGE_NAME}:${SHORT_SHA}" .
          docker push "${REGISTRY}/${IMAGE_NAME}:${SHORT_SHA}"
        '''
      }
    }
    stage('Update image tag') {
      when {
        not { expression { env.COMMIT_MSG.contains('[skip ci]') } }
      }
      steps {
        withCredentials([usernamePassword(credentialsId: 'github', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_TOKEN')]) {
          sh '''
            set -eu
            sed -i "s/^  tag:.*/  tag: ${SHORT_SHA}/" charts/tasks-api/values.yaml
            git config user.email "jenkins@localhost"
            git config user.name "Jenkins"
            git add charts/tasks-api/values.yaml
            if git diff --cached --quiet; then
              echo "image tag already ${SHORT_SHA}"
              exit 0
            fi
            git commit -m "chore: deploy image ${SHORT_SHA} [skip ci]"
            git push "https://${GIT_USERNAME}:${GIT_TOKEN}@github.com/${GIT_USERNAME}/gitops-tasks.git" HEAD:main
          '''
        }
      }
    }
  }
}
