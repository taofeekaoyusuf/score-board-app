pipeline {
    agent any
    
    environment {
        DOCKER_HUB_USER = "${DOCKER_HUB_USERNAME}"
        IMAGE_NAME      = "${DOCKER_HUB_USER}/score-board-app"
        IMAGE_TAG       = "${env.BUILD_NUMBER}"
        GITOPS_REPO     = "${MY_GITHUB_LINK}/score-board-app.git"
    }
    
    stages {

        stage('SonarQube Code Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarQube-Scanner'
                    
                    withSonarQubeEnv('SonarQube-Server') {
                        // Safe path inclusion that keeps basic system tools active
                        withEnv(['PATH+SONAR=/usr/local/bin:/opt/homebrew/bin']) {
                            sh """
                            ${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=taofeekaoyusuf_score-board-app \
                            -Dsonar.organization=taofeekaoyusuf \
                            -Dsonar.sources=src/ \
                            -Dsonar.host.url=https://sonarcloud.io
                            """
                        }
                    }
                }
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        
        stage('Build & Push Docker Image') {
            // 1. Inject the paths at the stage level BEFORE any steps execute
            environment {
                PATH = "/usr/local/bin:/opt/homebrew/bin:${env.PATH}"
            }
            steps {
                script {
                    // 2. The Docker plugin can now safely locate 'docker' to perform login
                    docker.withRegistry('', 'docker-hub-creds') {
                        def customImage = docker.build("IMAGE_NAME:${BUILD_NUMBER}")
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
                        
                        // Pushing changes back to GitHub
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