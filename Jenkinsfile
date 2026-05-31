pipeline {
    agent any
    
    environment {
        DOCKER_USER = "${DOCKER_USER}"
        IMAGE_NAME      = "score-board-app"
        IMAGE_TAG       = "${env.BUILD_TAG}"
        GITOPS_REPO     = "${MY_GITHUB_LINK}/score-board-gitops.git"
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
                        // Using Jenkins credentials binding to mask password safely
                        withCredentials([usernamePassword(credentialsId: 'docker-hub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                            
                            // Manual authentication of injected path environment
                            echo "LOGGING IN TO DOCKERHUB..."
                            sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"
                            
                            // Building the container image
                            echo "BUILDING DOCKER IMAGE..."
                            sh "docker build -t ${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG} ."
                            
                            // Pushing the image tags to Docker Hub
                            echo "PUSHING DOCKER IMAGE WITH THE LATEST TAG..."
                            sh "docker push ${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
                        }
                    }
                }
            }
        }

        stage('Update GitOps Manifests') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'GITHUB_TOKEN', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASSWORD')]) {
                        
                        // Clean up any old workspace directories
                        sh "rm -rf score-board-gitops"
                        
                        // FIXED CLONE URL: Notice there is NO "https://" right before github.com
                        sh "git clone https://${GIT_USER}:${GIT_PASSWORD}@github.com/taofeekaoyusuf/score-board-gitops.git"
                        
                        dir('score-board-gitops') {
                            echo 'UPDATING GITOPS MANIFESTS...'
                            
                            // Modifying the manifest file in-place using Mac BSD sed syntax
                            sh "sed -i '' 's|image: .*|image: dhackbility/score-board-app:jenkins-score-board-app-${env.BUILD_NUMBER}|g' argocd/deployment.yaml"
                            
                            // Configuring Git Identity
                            sh "git config user.email 'jenkins@devops.com'"
                            sh "git config user.name 'Jenkins CI'"
                            
                            // Stage and Commit changes locally
                            sh "git add argocd/deployment.yaml"
                            sh "git commit -m 'Automated Image Update: Tag ${env.BUILD_NUMBER} [skip ci]'"
                            
                            // Injecting credentials into the Git Cache seamlessly on a single line preventing the formatting issues from breaking multi-line string buffers
                            sh """
                                git config credential.helper 'cache --timeout=300'
                                printf "protocol=https\nhost=github.com\nusername=${GIT_USER}\npassword=${GIT_PASSWORD}\n\n" | git credential approve
                                
                                git push origin main
                            """
                        }
                    }
                }
            }
        }
    }
}