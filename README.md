# PRAJNA — Institutional AI & Faculty Management System

**Live Platform:**
[PRAJNA Live Platform](https://prajna.hemanthreddykoduru.dev/?utm_source=chatgpt.com)

PRAJNA is a cloud-native, serverless institutional management platform designed to streamline faculty workflows, research analytics, administrative approvals, and AI-assisted institutional insights.

The platform focuses on scalable architecture, secure authentication, infrastructure automation, and modular backend design using AWS-native services.

---

# 🏗️ System Architecture

PRAJNA follows a **Loosely Coupled, Serverless-First Architecture** provisioned entirely using **AWS CDK (Infrastructure as Code)**.

## Core Architecture Components

| Service                     | Responsibility                                   |
| --------------------------- | ------------------------------------------------ |
| Amazon Cognito              | Authentication, JWT sessions, role management    |
| Amazon API Gateway          | Secure API routing layer                         |
| AWS Lambda                  | Backend business logic and serverless compute    |
| Amazon DynamoDB             | Scalable NoSQL data storage                      |
| Amazon Bedrock              | AI-powered institutional insights                |
| Amazon Simple Email Service | Notification and authentication emails           |
| Amazon S3                   | Frontend asset hosting and storage               |
| Amazon CloudFront           | Global frontend delivery and caching             |
| AWS CDK                     | Infrastructure as Code and deployment automation |

---

# ⚙️ Why These Services Were Chosen

## Authentication — Cognito

Chosen for:
* JWT-based authentication
* managed identity workflows
* role-based access control
* secure session management

## Serverless Compute — Lambda

Chosen to:
* reduce infrastructure management
* support event-driven execution
* automatically scale with workloads

## API Layer — API Gateway

Chosen for:
* secure API exposure
* request routing
* JWT authorization integration
* serverless compatibility

## Database — DynamoDB

Chosen because:
* institutional data structures evolve frequently
* low-latency NoSQL access
* automatic horizontal scalability
* flexible schema design

## AI Integration — Bedrock

Chosen to:
* integrate managed foundation models
* avoid GPU infrastructure management
* support future AI-driven workflows

## Infrastructure — AWS CDK

Chosen because:
* infrastructure becomes version-controlled
* deployments are reproducible
* cloud resources can be managed programmatically

---

# 🔐 Security Architecture

PRAJNA follows a **Zero-Secret / Keyless Access Model**.

## Authentication Flow
* Users authenticate using Cognito
* Cognito issues temporary JWT tokens
* Frontend sends tokens in authorization headers
* API Gateway validates tokens before routing requests

## Backend Security
* Lambda functions use IAM execution roles
* No database passwords are hardcoded
* Bedrock and DynamoDB access are permission-controlled using IAM

## Data Isolation
* Database access is never exposed directly to the public internet
* All sensitive operations are handled through backend APIs

---

# 🔄 Example Request Workflow

## User Authentication & Data Fetch
1. User logs in through Cognito
2. Cognito generates JWT token
3. Frontend sends authenticated request to API Gateway
4. API Gateway validates the JWT token
5. Lambda processes the request
6. DynamoDB stores/retrieves institutional data
7. Response is returned securely to the frontend

---

# 🚀 Tech Stack

## Frontend
* React 19
* Vite 8
* TypeScript
* Tailwind CSS v4

## Cloud Infrastructure
* AWS Lambda
* API Gateway
* DynamoDB
* Cognito
* Bedrock
* SES
* S3
* CloudFront

## Infrastructure as Code
* AWS CDK (TypeScript)

## State Management
* React Context API
* React Hooks

## Authentication
* AWS Amplify
* Cognito JWT Authentication

---

# 🛠️ Project Structure

```txt
packages/
 ├── frontend/        # React frontend application
 ├── backend/         # Lambda handlers and backend logic

infrastructure/
 ├── stacks/          # AWS CDK stack definitions
```

---

# 🚀 Deployment

The infrastructure is deployed using AWS CDK:

```bash
cd infrastructure
cdk deploy --all
```

This provisions:
* authentication infrastructure
* APIs
* Lambda functions
* DynamoDB tables
* CDN delivery
* frontend hosting
* AI integrations

---

# 📈 Architecture Characteristics

| Category              | Evaluation             |
| --------------------- | ---------------------- |
| Scalability           | High                   |
| Maintainability       | High                   |
| Operational Overhead  | Low                    |
| Deployment Automation | Infrastructure as Code |
| Security Model        | IAM + JWT-based        |
| Compute Model         | Serverless             |
| Infrastructure Style  | Loosely Coupled        |

---

# 🎯 Engineering Focus

PRAJNA was designed with emphasis on:
* modular cloud-native architecture
* serverless scalability
* infrastructure automation
* secure authentication workflows
* loosely coupled systems
* AI-assisted institutional workflows

---

# 📌 Summary

PRAJNA is a modular serverless platform that combines authentication, scalable APIs, NoSQL storage, AI integrations, and infrastructure automation to support institutional-scale workflow management and analytics.
