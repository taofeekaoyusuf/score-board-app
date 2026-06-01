# Automated Enterprise GitOps CI/CD Pipeline with SonarQube Cloud, Jenkins & Argo CD

This repository showcases a complete modern GitOps software delivery pipeline deploying a Score Board Application. Source code changes trigger an automated build and security checking workflow, culminating in automated, zero-touch Kubernetes deployments via declarative desired-state configuration syncing. This project is the complimentary project to [Score-Board-GitOps](https://github.com/taofeekaoyusuf/score-board-gitops) project.

## SCOREBOARD APPLICATION

#### This is an application to record the scores of any game being played by two Opponents.

<img width="3024" height="1612" alt="image" src="https://github.com/user-attachments/assets/0951d038-0e90-42fd-8520-1a6377caafca" />

## Architecture Flow

1. **Application Codes** along with **Dockerfile** and **Jenkinsfile** are pushes to the Application Repository (`score-board-app`).
2. **Jenkins** detects changes via Webhooks and fires up the multi-stage pipeline.
3. Code quality and security vulnerability checks are performed via **SonarQube Quality Gates on SonarCloud**.
4. Upon validation success, a **Docker image** is compiled and securely pushed to Docker Hub.
5. Jenkins dynamically edits the **Kubernetes** manifest repository (`gitops-repo`), tracking the precise application version tag.
6. **ArgoCD** identifies a delta between the live cluster state and git desired state, initiating an automated rolling sync into the Kubernetes Cluster.

## Tech Stack Used

* **Automation Server**: Jenkins CI
* **Code Analytics Quality Gate**: SonarQube
* **Containerization Engine**: Docker
* **Declarative GitOps Engine**: Argo CD
* **Target Runtime Platform**: Kubernetes

## Prerequisites & Dependencies

To execute this architecture locally or on a cloud platform, verify the installation of:
* **Docker Engine** (v20.10+)
* **Minikube** or **Kind** (Kubernetes Cluster v1.26+)
* **Jenkins Server** with standard plugins installed:
  * SonarQube Scanner
  * Pipeline: Stage View
  * Docker Pipeline
  * Credentials Binding
* **Argo CD** installed on your cluster:
  - kubectl create namespace argocd
  - kubectl apply -n argocd -f [https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml](https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml)
  - To port-forward ArgoCD Server for access, do:
  `kubectl port-forward svc/argocd-server -n argocd 8089:443 &`
  - You can then acceess it at: `https://localhost:8089`
  - To login to the ArgoCD UI:
      Username: admin
      Password: Run this command to get the Password: `kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d && echo`
  - ArgoCD login Interface:
  ![argocd_login_interface](image.png)
  - After login into ArgoCD, you will be met with the deployed Application, thus:
  ![argocd-deployed-application-page](image-2.png)

The complimentary GitOps Repository can found [here](https://github.com/taofeekaoyusuf/score-board-gitops)

To access and play with the Score Board Application, go to `127.0.0.1:80` or `http://localhost:80`

This application can be forked and modified as pleased for more robustness.

@Copyright: TAOY