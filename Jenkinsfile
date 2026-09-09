pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "rdk1612/market-development-centre:latest"
    }

    stages {

        stage('Verify Node.js') {
            steps {
                echo 'Checking Node.js...'
                bat 'node --version'
            }
        }

        stage('Verify Docker') {
            steps {
                echo 'Checking Docker...'
                bat 'docker --version'
                bat 'docker info'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Building Docker image: ${DOCKER_IMAGE}"
                bat "docker build -t ${DOCKER_IMAGE} ."
            }
        }

        stage('Login to DockerHub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-cred',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    bat 'echo %DOCKER_PASSWORD% | docker login -u %DOCKER_USERNAME% --password-stdin'
                }
            }
        }

        stage('Push Image') {
            steps {
                echo "Pushing image to Docker Hub..."
                bat "docker push ${DOCKER_IMAGE}"
            }
        }
    }

    post {
        success {
            echo 'CI/CD Pipeline completed successfully!'
        }

        failure {
            echo 'CI/CD Pipeline failed.'
        }

        always {
            bat 'docker logout || exit 0'
        }
    }
}