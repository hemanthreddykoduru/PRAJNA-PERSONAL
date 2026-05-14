# PRAJNA: Institutional AI & Faculty Management System

PRAJNA is a production-ready, serverless ecosystem designed for large-scale institutional management. It automates faculty performance tracking, research analytics, and administrative workflows using a high-fidelity React frontend and an elite AWS cloud architecture.

---

## 🏗️ System Architecture (The 9 Pillars)

PRAJNA is built on a **Loosely Coupled, Serverless-First Architecture** provisioned entirely via **AWS CDK (Infrastructure as Code)**.

1.  **Identity & Security**: **AWS Cognito** provides enterprise-grade SSO and JWT-based session management.
2.  **Global Delivery**: **Amazon CloudFront** + **S3** serves the React frontend at the edge with millisecond latency.
3.  **API Gateway**: Acts as the secure perimeter and routing layer for all backend interactions.
4.  **Decoupled Compute**: **AWS Lambda** handles all business logic, ensuring infinite scalability and zero-cost-at-rest.
5.  **Intelligence Engine**: **Amazon Bedrock** integration provides managed AI insights and career guidance.
6.  **Persistence Layer**: **Amazon DynamoDB** offers high-performance NoSQL storage for institutional records.
7.  **Communication**: **Amazon SES** ensures high-deliverability for institutional notifications and auth workflows.
8.  **Orchestration**: **AWS CDK** defines the entire 5-stack infrastructure (Api, Foundation, Website, Chat, Toolkit).
9.  **Frontend Core**: **React 19** + **Vite 8** + **Tailwind CSS v4** delivers a premium, data-driven UI experience.

---

## 🛡️ Security Posture: Zero-Secret Model

PRAJNA implements a **"Keyless" Security Pattern**, eliminating hardcoded API keys and secrets:

*   **User Auth**: JWT (JSON Web Tokens) issued by Cognito with strict OIDC validation at the API Gateway.
*   **Service Auth**: **IAM Execution Roles** grant least-privileged access to DynamoDB and Bedrock—no passwords required.
*   **Data Isolation**: All database and AI interactions are proxied through secure backend handlers; the database is never exposed to the public internet.

---

## 🚀 Tech Stack

- **Frontend**: React 19, Vite 8, TypeScript, Tailwind CSS v4.
- **Cloud Infrastructure**: AWS (Lambda, API Gateway, DynamoDB, Cognito, Bedrock, SES, S3, CloudFront).
- **IaC**: AWS CDK (TypeScript).
- **State Management**: React Context API + Hooks.
- **Authentication**: AWS Amplify / Cognito (OIDC/JWT).

---

## 🛠️ Development & Deployment

### Monorepo Structure
- `packages/frontend`: React Application.
- `packages/backend`: Serverless Lambda Handlers.
- `infrastructure/`: AWS CDK Stacks.

### Deployment
The entire environment is deployed as a unified stack:
```bash
cd infrastructure
cdk deploy --all
```

---

## 🕵️ Architectural Assessment
- **Scalability**: High (Serverless primitives).
- **Maintainability**: High (Infrastructure as Code).
- **Security**: Enterprise Grade (IAM/Cognito).
- **Operational Cost**: Optimized (Zero-cost-at-rest).

---
*Built for the future of institutional intelligence.*
