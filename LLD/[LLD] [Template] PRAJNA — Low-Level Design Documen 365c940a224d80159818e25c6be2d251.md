# [LLD] [Template] PRAJNA — Low-Level Design Document

## [Module Name]

**Version:** 1.0
**Date:** [DD MMM YYYY]
**Author:** [Student Name]
**Reviewer:** [Mentor Name]
**Status:** Draft | In Review | Approved

---

## Architecture Constraints (Read Before You Start)

All technology choices in your LLD **must** follow these project-wide constraints. These are non-negotiable unless you get explicit approval from the architect.

**Language & Libraries**

- TypeScript only — all libraries must be TypeScript-based or have TypeScript type definitions
- No exceptions without architect approval

**Infrastructure**

- AWS Serverless only — Lambda, API Gateway, DynamoDB, S3, Cognito, SQS, SNS, EventBridge, Step Functions, Aurora Serverless v2, Amazon Bedrock etc.
- No EC2, ECS, EKS, or self-managed servers
- Any exception requires written approval before including in your LLD

**CDK**

- All infrastructure must be defined using AWS CDK (TypeScript)
- Each module owns its own CDK stack

**If you believe your module needs something outside these constraints, raise it in Section 13 (Open Questions) with your justification. Do not assume approval.**

---

## 1. Module Overview

- What does this module do?
- Why does it exist in PRAJNA?
- Who are the end users of this module?

---

## 2. Scope

### In Scope

- [List what this module covers]

### Out of Scope

- [List what this module does NOT cover and which module handles it]

---

## 3. Dependencies

### Depends On (modules this needs to work)

- [Module name] — [what it provides]

### Depended By (modules that need this to work)

- [Module name] — [what it consumes]

---

## 4. Architecture & Design

### Component Diagram

- [Describe or link a diagram showing how this module's components interact]

### Data Flow

- [Step-by-step flow of data through this module — from input to output]

---

## 5. Data Model

### Entities

- [List the key entities/tables this module owns]
- [For each: fields, types, constraints, relationships]

### Access Patterns

- [How will this data be queried? List the key access patterns]

---

## 6. API Design

### Endpoints

| Method | Endpoint | Description | Auth Required | Request Body | Response |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |

### Error Handling

- [How does this module handle errors? What error codes/messages does it return?]

---

## 7. Technology Choices

For each choice, justify **why** you picked it over alternatives.

| Area | Choice | Why | Alternatives Considered |
| --- | --- | --- | --- |
|  |  |  |  |

---

## 8. Security Considerations

- [Authentication/authorization for this module]
- [Data privacy — who can see what?]
- [Input validation approach]
- [Any sensitive data handling?]

---

## 9. Testing Strategy

| Type | What You'll Test | Tool/Approach |
| --- | --- | --- |
| Unit |  |  |
| Integration |  |  |
| E2E |  |  |

---

## 10. CDK / Infrastructure

- [What AWS resources does this module need?]
- [CDK stack design — constructs, parameters, outputs]
- [How does this stack connect to other module stacks?]

---

## 11. Risks & Mitigation

| Risk | Impact | Mitigation |
| --- | --- | --- |
|  |  |  |

---

## 12. Milestones & Timeline

| Week | Deliverable |
| --- | --- |
| Week 1–2 | LLD complete & approved |
| Week 3–4 |  |
| Week 5–6 |  |
| Week 7–8 |  |
| Week 9–10 |  |
| Week 11–12 |  |

---

## 13. Open Questions

- [List anything you're unsure about that needs discussion with the team or mentor]

---

## 14. Self-Assessment — Amazon Leadership Principles

Review all 14 LPs below. Pick your **top 3 you demonstrated** and **top 3 you need to work on**. Provide an example for each.

| # | Leadership Principle | Demonstrated / Need to Work On | Example from Your Work |
| --- | --- | --- | --- |
| 1 | **Customer Obsession** — Who is your module's customer? How did you design for them? |  |  |
| 2 | **Ownership** — How did you take end-to-end ownership of your module? |  |  |
| 3 | **Invent and Simplify** — Where did you simplify a complex problem? |  |  |
| 4 | **Are Right, A Lot** — What decision did you make with incomplete information? How did it turn out? |  |  |
| 5 | **Learn and Be Curious** — What new technology/concept did you learn for this module? |  |  |
| 6 | **Hire and Develop the Best** — How did you help a teammate or learn from one? |  |  |
| 7 | **Insist on the Highest Standards** — Where did you refuse to cut corners? |  |  |
| 8 | **Think Big** — How does your module scale or support PRAJNA's long-term vision? |  |  |
| 9 | **Bias for Action** — Where did you make a quick decision instead of over-analyzing? |  |  |
| 10 | **Frugality** — How did you achieve more with less? |  |  |
| 11 | **Earn Trust** — How did you handle disagreements or build trust with your team? |  |  |
| 12 | **Dive Deep** — Where did you dig into the details to find the right solution? |  |  |
| 13 | **Have Backbone; Disagree and Commit** — Did you push back on a decision? How? |  |  |
| 14 | **Deliver Results** — Did you meet your milestones? What did you ship? |  |  |

**Top 3 I Demonstrated:**
1.
2.
3.

**Top 3 I Need to Work On:**
1.
2.
3.

---

## 15. References

- [Links to HLD, requirements doc, AWS docs, library docs, etc.]

---

*PRAJNA — प्रज्ञा | Super-30*