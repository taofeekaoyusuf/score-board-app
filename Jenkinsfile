pipeline {
    agent any
    
    environment {
        DOCKER_HUB_USER = "${DOCKER_HUB_USERNAME}"
        IMAGE_NAME      = "${DOCKER_HUB_USER}/score-board-app"
        IMAGE_TAG       = "${env.BUILD_NUMBER}"
        GITOPS_REPO     = "${MY_GITHUB_LINK}/score-board-app.git"
    }
    
    stages {
        stage('Code Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('SonarQube Code Analysis') {
            steps {
                // Requires SonarQube Scanner plugin configured in Jenkins
                withSonarQubeEnv('SonarQube-Server') {
                    sh 'sonar-scanner -Dsonar.projectKey=score-board-app -Dsonar.sources=src/'
                }
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        
        stage('Build & Push Docker Image') {
            steps {
                script {
                    docker.withRegistry('', 'docker-hub-creds') {
                        def customImage = docker.build("${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}")
                        customImage.push()
                        customImage.push('latest')
                    }
                }
            }
        }
        
        stage('Update GitOps Manifests') {
            steps {
                script {
                    // Cloning the infrastructure repository cleanly
                    sh 'rm -rf score-board-app'
                    withCredentials([usernamePassword(credentialsId: 'GITHUB_TOKEN_FOR_JENKINS', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
                        sh "git clone https://${GIT_USERNAME}:${GIT_PASSWORD}@${GITOPS_REPO}"
                    }
                    
                    dir('score-board-app') {
                        // Using sed to update the image tag dynamically inside deployment.yaml
                        sh "sed -i 's|image: .*|image: ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}|g' argocd/deployment.yaml"
                        
                        // Push changes back to GitHub
                        sh 'git config user.email "jenkins@devops.com"'
                        sh 'git config user.name "Jenkins CI"'
                        sh "git add argocd/deployment.yaml"
                        sh "git commit -m 'Automated Image Update: Tag ${IMAGE_TAG} [skip ci]'"
                        
                        withCredentials([usernamePassword(credentialsId: 'GITHUB_TOKEN_FOR_JENKINS', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
                            sh "git push https://${GIT_USERNAME}:${GIT_PASSWORD}@${GITOPS_REPO} HEAD:main"
                        }
                    }
                }
            }
        }
    }
}