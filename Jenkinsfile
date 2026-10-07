pipeline {

    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Cloning Market Development Centre...'
                git branch: 'main',
                    url: 'https://github.com/ABOMINATION14/MARKET-DEVELOPEMENT-CENTRE.git'
            }
        }

        stage('Maven Build') {
            steps {
                echo 'Building Java programs using Maven...'
                bat 'mvn clean compile'
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building Docker image...'
                bat 'docker build -t market-development-centre:latest .'
            }
        }

        stage('Docker Run Test') {
            steps {
                echo 'Testing Docker container...'

                bat '''
                docker rm -f market-development-centre-test 2>NUL || exit 0
                docker run -d --name market-development-centre-test -p 8080:8080 market-development-centre:latest
                '''

                bat 'timeout /t 10'

                bat 'docker ps'

                bat '''
                docker rm -f market-development-centre-test
                '''
            }
        }
    }

    post {
        success {
            echo 'BUILD SUCCESSFUL - Maven and Docker completed successfully.'
        }

        failure {
            echo 'BUILD FAILED - Check the Jenkins console output.'
        }
    }
}
