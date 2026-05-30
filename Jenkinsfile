pipeline {
    agent any
    
    environment {
        DOCKER_USER = "${DOCKER_USER}"
        IMAGE_NAME      = "${DOCKER_USER}/score-board-app"
        IMAGE_TAG       = "${env.BUILD_NUMBER}"
        GITOPS_REPO     = "${MY_GITHUB_LINK}/score-board-app.git"
        // PATH            = "/usr/local/bin:/opt/homebrew/bin:${env.PATH}" // Ensuring 'docker' is available in the PATH for the Docker plugin
    }
    
    stages {
        stage('SonarQube Code Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarQube-Scanner'
                    
                    withSonarQubeEnv('SonarQube-Server') {
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
            steps {
                // Bypassing the plugin and using explicit path environments with raw shell execution
                withEnv(['PATH+DOCKER=/usr/local/bin:/opt/homebrew/bin']) {
                    script {
                        // Use Jenkins credentials binding to mask your password safely
                        withCredentials([usernamePassword(credentialsId: 'docker-hub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                            
                            // Manual authentication of injected path environment
                            echo "LOGGING IN TO DOCKERHUB..."
                            sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"
                            
                            // Building the container image
                            echo "BUILDING DOCKER IMAGE..."
                            sh "docker build -t ${DOCKER_USER}/${IMAGE_NAME}:${env.BUILD_NUMBER} ."
                            
                            // Pushing the image tags to Docker Hub
                            echo "PUSHING DOCKER IMAGE WITH THE LATEST TAG..."
                            sh "docker push ${DOCKER_USER}/${IMAGE_NAME}:${env.BUILD_NUMBER}"
                            sh "docker tag ${DOCKER_USER}/${IMAGE_NAME}:${env.BUILD_NUMBER} ${DOCKER_USER}/${IMAGE_NAME}:latest"
                            sh "docker push ${DOCKER_USER}/${IMAGE_NAME}:latest"
                        }
                    }
                }
            }
        }
        
        // stage('Build & Push Docker Image') {
        //     steps {
        //         script {
        //             // Docker plugin locating 'docker' to perform login
        //             docker.withRegistry('', 'docker-hub-creds') {
        //                 def customImage = docker.build("IMAGE_NAME:${BUILD_NUMBER}")
        //                 customImage.push()
        //                 customImage.push('latest')
        //             }
        //         }
        //     }
        // }
        
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
                        echo "UPDATING GITOPS MANIFESTS..."
                        sh "sed -i 's|image: .*|image: ${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG}|g' argocd/deployment.yaml"
                        
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