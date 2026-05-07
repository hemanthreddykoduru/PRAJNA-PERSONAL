

## **You said: /caveman lite read this doc and understand full project informantion all a to z full knowledge**

### **PRAJNA\_v3\_Complete\_Requirements (1).docx**

docx  
/  
caveman lite read this doc and understand full project informantion all a to z full knowledge  
18:24

## **Claude responded: Got it.**

Prepared comprehensive project overview synthesis  
Prepared comprehensive project overview synthesis  
Got it. Full document digested. Here's the complete A-to-Z knowledge dump on **PRAJNA**:  
---

### **🧠 PRAJNA — Complete Project Brief**

#### **What It Is**

An AI-powered professional companion for GITAM faculty — not a portal, not a tracker. Think personal coach \+ career guide \+ motivator, built on top of faculty data. Sanskrit: प्रज्ञा (deep intelligence, inner wisdom).  
---

#### **Who Sponsors It**

**Dr. Kishore Budda** — Director, Core Engineering, GITAM University Bengaluru. He's the product owner, vision holder, and UAT lead.  
**Tech side:** Navaneeth (lead architect) \+ CATS Team (senior devs) \+ 10 GITAM student developers.  
---

#### **Timeline**

* **Start:** 1 April 2026  
* **Go-Live:** 30 June 2026  
* **Why:** New semester begins 1 July 2026 — every faculty should open it with PRAJNA active.

---

#### **Campuses**

Bengaluru | Visakhapatnam | Hyderabad (Core Engineering Schools only, Phase 1\)  
---

#### **Phase Scope**

* **Phase 1:** Faculty lifecycle companion (current build)  
* **Phase 2:** Students  
* **Phase 3:** University-wide

---

### **Core Features**

**For Faculty (primary user):**

* Morning briefing: "Your 3 priorities today are…"  
* Achievement celebration on every approved publication/FDP/award  
* End-of-day sign-off: summary \+ tomorrow's focus  
* AI companion chat (free-form, private — HoD/Director cannot see it)  
* PRAJNA Score (live composite excellence rating)  
* Leaderboard (department rank, school rank)  
* Career roadmap — gap to next promotion, what's missing  
* Profile completeness bar (more data \= better guidance)  
* Mobile-first PWA

**For HoD:**

* Department dashboard — all faculty profiles, completion %, research, FDP status  
* Workload balance view  
* Approval queue (publications, FDPs, APARs)  
* Faculty needing attention flags

**For Director (Dr. Kishore):**

* Command Centre — all 3 campuses side-by-side  
* Real-time faculty activity pulse  
* Inspection Readiness Score per department (0–100%)  
* One-click NAAC/NBA/NIRF report generation  
* Weekly auto-emailed executive summary (Mondays)  
* Top performers leaderboard  
* Promotion eligibility flags  
* Send personal appreciation badge to any faculty

**For IQAC:**

* Continuous Inspection Readiness Score  
* NAAC Criteria I–VII report auto-populated  
* NBA OBE \+ CO-PO mapping auto-filled  
* NIRF data ready to export  
* Data gaps highlighted

---

### **PRAJNA Score — The Faculty Excellence Index**

| Dimension | Weight |
| ----- | ----- |
| Teaching Excellence | 25% |
| Research & Innovation | 30% |
| Professional Development | 20% |
| Achievements & Recognition | 10% |
| Administrative Contribution | 10% |
| Profile Completeness Bonus | 5% |

**Tiers:** Bronze (0–40) → Silver → Gold → Platinum → PRAJNA Fellow (96–100)  
---

### **6 Data Clusters Captured**

1. **Personal & Professional Profile** — name, DOB, EmpID, qualifications, ORCID, Scopus ID, VIDWAN ID, etc.  
2. **Course Deliverables & Teaching** — timetable, attendance, lesson plans, CO-PO mapping, CIA marks, feedback scores  
3. **Research & Innovation** — papers (DOI, indexing, IF), grants, patents, PhD scholars, consultancy, MoUs  
4. **Achievements & Recognition** — awards, invited talks, editorial roles, IEEE/ISTE memberships  
5. **Faculty Development & Growth** — FDPs, MOOCs/NPTEL, workshops, international visits  
6. **Administrative & Lifecycle** — leave, APAR, API score, committee roles, exit records

---

### **Approval Workflows**

Every data type has **entered by → Level 1 approver → Level 2 approver**. Key flows:

* **Publications:** Faculty → HoD → Dean (SCI/Scopus only)  
* **Patents:** Faculty → HoD → Dean \+ Director  
* **FDP certs:** Faculty → HoD → **auto-approve after 7 days if no action**  
* **APAR:** Faculty (self) → HoD → Dean → Director/HR

---

### **AI Companion Engine**

* **Phase 1:** Rule-based \+ LLM API (OpenAI GPT-4 or **Anthropic Claude API** — yes, that's this very AI)  
* Each response built from live PRAJNA profile data via prompt engineering  
* Private: AI chat not visible to HoD or Director  
* Tone: encouraging, warm, mentor-like  
* **Fallback:** Rule-based responses auto-activate if AI API is down  
* **Phase 2:** Fine-tuned model on GITAM academic data

---

### **Tech Stack**

| Layer | Tech |
| ----- | ----- |
| Frontend | React.js \+ Tailwind CSS \+ PWA |
| Backend | Node.js \+ TypeScript \+ Express |
| Database | PostgreSQL \+ Prisma ORM (AWS RDS) |
| AI | OpenAI GPT-4 / Anthropic Claude API |
| File Storage | AWS S3 \+ CloudFront CDN |
| Auth | JWT \+ OAuth 2.0 \+ OTP MFA |
| Notifications | Nodemailer \+ WhatsApp (Meta) \+ Twilio SMS |
| Cache | Redis (AWS ElastiCache) |
| Monitoring | AWS CloudWatch \+ Sentry |
| CI/CD | GitHub Actions \+ Docker |
| Reports | Puppeteer (PDF) \+ SheetJS (Excel) |

Architecture: **Modular Monolith** for Phase 1, clean migration path to microservices in Phase 3\.  
---

### **Sprint Plan (90 days)**

| Sprint | Dates | What Ships |
| ----- | ----- | ----- |
| 0 | Apr 1–7 | Kickoff, AWS, DB schema, GITAM Portal demo |
| 1 | Apr 8–21 | Auth, RBAC, faculty profile, admin panel |
| 2 | Apr 22–May 5 | Teaching, timetable, attendance, CO-PO |
| 3 | May 6–19 | Research module, DOI fetch, approval workflow ← **ALPHA** |
| 4 | May 20–Jun 2 | Achievements, FDP, leaderboard v1, notifications |
| 5 | Jun 3–16 | APAR, PRAJNA Score, AI Companion, Director dashboard, NAAC reports ← **BETA** |
| 6 | Jun 17–23 | UAT, pilot migration, security testing, training |
| 🚀 | Jun 30 | **GO-LIVE** |

### **Key Escalation Rules**

* APAR not submitted → Faculty notified → Day 25 escalates to HoD → Day 28 Dean → Day 30 Director  
* FDP cert pending → Auto-approved Day 7 with log  
* Feedback score \< 3.0 → HoD counselling flag  
* No research activity in 90 days → PRAJNA nudges, then HoD alert  
* Profile \< 60% complete → Weekly nudge, HoD CC'd at Day 30

---

### **NFRs (Performance \+ Security)**

* Dashboard loads: **\< 2 sec**  
* Report generation: **\< 10 sec**  
* AI response: **\< 5 sec**  
* Uptime: **99.5%**  
* Encryption: AES-256 at rest, TLS 1.3 in transit  
* Data retention: **7 years** (UGC norms)  
* AI chat: **strictly private to faculty only**

---

**Bottom line:** PRAJNA is a faculty excellence platform with AI at its core — your job is essentially building a companion that knows every faculty member's academic life, coaches them daily, and generates compliance-ready reports on demand. The real differentiator is the AI Companion layer \+ PRAJNA Score engine. Everything else is a well-structured CRUD \+ approval workflow system.  
What do you want to work on first?

## **You said: use this and read the total project full details and everything help me to build this project a to z in development**

**db403fa9-ba57-4e0d-bfdc-64f6010f9826\_HLD\_PRAJNA\_\_High-Level\_Design\_Document.pdf**  
pdf  
ef47686f-d2b0-4bbb-8caf-69470ba89fe3\_LLD\_Template\_PRAJNA\_\_Low-Level\_Design\_Document\_.pdf  
pdf  
80a9f659-ab30-437a-8c0a-b20f9719f5e8\_PRAJNA\_\_Development\_Cost\_Estimation.pdf  
pdf  
use this and read the total project full details and everything help me to build this project a to z in development  
18:44

## **Claude responded: All three documents absorbed.**

Synthesized comprehensive project architecture and formulated complete development roadmap  
Synthesized comprehensive project architecture and formulated complete development roadmap  
All three documents absorbed. Here's the complete picture — and a full A-to-Z development guide.  
---

### **⚠️ Important: Architecture Discrepancy**

The Requirements doc (v3) and the HLD don't fully match. **HLD overrides everything.** Key differences:

| Topic | Requirements Doc | HLD (Final) |
| ----- | ----- | ----- |
| Architecture | Modular Monolith, Node+Express | **Serverless on AWS** |
| Backend | Node.js \+ Express | **AWS Lambda \+ TypeScript** |
| Database | PostgreSQL \+ Prisma | **DynamoDB \+ Aurora Serverless v2** |
| Auth | JWT \+ OAuth | **AWS Cognito** |
| AI | OpenAI / Claude API | **Amazon Bedrock** |
| Infra | Docker \+ EC2 | **AWS CDK (no servers)** |
| CI/CD | GitHub Actions | **AWS CodePipeline \+ CodeBuild** |

**Follow the HLD. It's the architect's final word.**  
---

### **🗂️ Full Project Structure**

PRAJNA/  
├── infrastructure/          \# CDK stacks (one per module)  
├── packages/  
│   ├── shared/              \# Shared types, utils, constants  
│   ├── lambdas/             \# All Lambda functions  
│   │   ├── auth/  
│   │   ├── faculty-profile/  
│   │   ├── research/  
│   │   ├── ai-companion/  
│   │   └── ... (one per module)  
│   └── frontend/            \# React PWA  
├── scripts/                 \# Migration, seeding, utilities  
└── docs/                    \# LLDs per module  
---

### **Phase 0: Setup (Do This First — Day 1\)**

#### **1\. AWS Organization Setup**

bash  
\# One management account → 30 member accounts (one per student)  
\# SCPs restrict to serverless only  
\# Budget alert per account: ₹500/month cap  
AWS services to allow via SCP: lambda, dynamodb, s3, apigateway, cognito-idp, cloudwatch, xray, bedrock, ses, sns, sqs, events (EventBridge), rds (Aurora Serverless), codepipeline, codebuild, cdk

#### **2\. Local Dev Environment**

bash  
\# Install  
node \--version        \# Need v20+  
npm install \-g aws-cdk typescript ts-node

\# AWS CLI  
aws configure         \# Access key from your AWS dev account

\# Verify CDK  
cdk \--version         \# Should be 2.x

#### **3\. Repo Structure**

bash  
git clone \<prajna-repo\>  
cd prajna  
npm install           \# Root package.json with workspaces

\# Each module has its own CDK stack in /infrastructure/stacks/  
---

### **Phase 1: Core Platform (Modules 1–6) — Weeks 1–4**

These must be built **before anything else**. Everything depends on them.

#### **Module 1: CDK Foundation**

typescript  
// infrastructure/stacks/foundation-stack.ts  
import \* as cdk from 'aws-cdk-lib';

export class PrajnaFoundationStack extends cdk.Stack {  
  // Shared constructs other stacks import:  
  public readonly vpc: ec2.Vpc;           // NOT needed for serverless  
  public readonly table: dynamodb.Table;  // Shared DynamoDB  
  public readonly bucket: s3.Bucket;      // Document vault  
    
  // Tagging standard — ALL resources get:  
  constructor(scope: Construct, id: string, props: FoundationProps) {  
    super(scope, id, props);  
    cdk.Tags.of(this).add('Project', 'PRAJNA');  
    cdk.Tags.of(this).add('Campus', props.campus);  
    cdk.Tags.of(this).add('Module', id);  
    cdk.Tags.of(this).add('Env', props.env); // dev/staging/prod  
  }  
}  
**Key outputs** (exported for other stacks):

* DynamoDB table ARN  
* S3 bucket ARN  
* EventBridge bus ARN  
* Cognito User Pool ID

#### **Module 3: Auth & User Management**

typescript  
// Cognito User Pool setup  
const userPool \= new cognito.UserPool(this, 'PrajnaUserPool', {  
  userPoolName: 'prajna-users',  
  selfSignUpEnabled: false,     // Admin creates accounts only  
  signInAliases: { email: true },  
  mfa: cognito.Mfa.OPTIONAL,  
  mfaSecondFactor: { sms: true, otp: true },  
  passwordPolicy: {  
    minLength: 8,  
    requireUppercase: true,  
    requireDigits: true,  
  },  
  accountRecovery: cognito.AccountRecovery.EMAIL\_ONLY,  
});

// Groups \= Roles  
const roles \= \['Faculty', 'HoD', 'Director', 'ProVC', 'IQAC', 'Admin'\];  
roles.forEach(role \=\> {  
  new cognito.CfnUserPoolGroup(this, \`${role}Group\`, {  
    userPoolId: userPool.userPoolId,  
    groupName: role,  
    description: \`PRAJNA ${role} role\`,  
  });  
});  
**JWT claims structure:**  
json  
{  
  "sub": "uuid",  
  "email": "faculty@gitam.edu",  
  "custom:role": "Faculty",  
  "custom:campus": "bengaluru",  
  "custom:department": "CSE",  
  "custom:empId": "GITAM001"  
}

#### **Module 5: Database Layer**

**DynamoDB — primary table (single-table design):**  
typescript  
// Primary table pattern  
const table \= new dynamodb.Table(this, 'PrajnaTable', {  
  tableName: 'prajna-main',  
  partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },  
  sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },  
  billingMode: dynamodb.BillingMode.PAY\_PER\_REQUEST,  
  pointInTimeRecovery: true,  
  stream: dynamodb.StreamViewType.NEW\_AND\_OLD\_IMAGES, // for audit trail  
});

// GSIs for common access patterns  
table.addGlobalSecondaryIndex({  
  indexName: 'GSI1',  // campus \+ role queries  
  partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },  
  sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },  
});

table.addGlobalSecondaryIndex({  
  indexName: 'GSI2',  // department queries  
  partitionKey: { name: 'GSI2PK', type: dynamodb.AttributeType.STRING },  
  sortKey: { name: 'GSI2SK', type: dynamodb.AttributeType.STRING },  
});  
**Key access patterns:**

| Pattern | PK | SK |
| ----- | ----- | ----- |
| Get faculty profile | FACULTY\#\<empId\> | PROFILE |
| Get all faculty in dept | DEPT\#\<deptId\> | FACULTY\#\<empId\> |
| Get faculty publications | FACULTY\#\<empId\> | PUB\#\<pubId\> |
| Pending approvals for HoD | APPROVAL\#\<hodId\> | STATUS\#PENDING\#\<timestamp\> |
| PRAJNA Score | FACULTY\#\<empId\> | SCORE |
| Leaderboard (dept) | LEADERBOARD\#\<deptId\> | SCORE\#\<score\> |

**Aurora Serverless v2** — for reports only:  
typescript  
const cluster \= new rds.DatabaseCluster(this, 'PrajnaAurora', {  
  engine: rds.DatabaseClusterEngine.auroraPostgres({  
    version: rds.AuroraPostgresEngineVersion.VER\_15\_4,  
  }),  
  serverlessV2MinCapacity: 0.5,  
  serverlessV2MaxCapacity: 4,  
  writer: rds.ClusterInstance.serverlessV2('writer'),  
  // No readers for Phase 1 — cost saving  
});  
---

### **Phase 2: Faculty Data Modules (7–12) — Weeks 3–6**

#### **Module 7: Personal Profile**

typescript  
// Lambda handler pattern (all modules follow this)  
// packages/lambdas/faculty-profile/handlers/get-profile.ts

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';  
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';  
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const client \= DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler \= async (  
  event: APIGatewayProxyEvent  
): Promise\<APIGatewayProxyResult\> \=\> {  
  // Extract from JWT (injected by Cognito authorizer)  
  const empId \= event.requestContext.authorizer?.claims\['custom:empId'\];  
  const role \= event.requestContext.authorizer?.claims\['custom:role'\];  
  const campus \= event.requestContext.authorizer?.claims\['custom:campus'\];

  // Role check: Faculty can only get own profile  
  // HoD can get any profile in their dept  
  const targetEmpId \= event.pathParameters?.empId || empId;  
    
  if (role \=== 'Faculty' && targetEmpId \!== empId) {  
    return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };  
  }

  const result \= await client.send(new GetCommand({  
    TableName: process.env.TABLE\_NAME\!,  
    Key: { PK: \`FACULTY\#${targetEmpId}\`, SK: 'PROFILE' },  
  }));

  return {  
    statusCode: 200,  
    body: JSON.stringify(result.Item),  
  };  
};  
**Faculty Profile schema (DynamoDB item):**  
typescript  
interface FacultyProfile {  
  PK: string;           // FACULTY\#\<empId\>  
  SK: string;           // PROFILE  
  GSI1PK: string;       // CAMPUS\#\<campus\>  
  GSI1SK: string;       // DEPT\#\<dept\>\#FACULTY\#\<empId\>  
  GSI2PK: string;       // DEPT\#\<dept\>  
  GSI2SK: string;       // FACULTY\#\<empId\>  
    
  empId: string;  
  name: string;  
  email: string;  
  phone: string;  
  campus: 'bengaluru' | 'vizag' | 'hyderabad';  
  department: string;  
  designation: string;  
  joiningDate: string;  
    
  qualifications: {  
    ug: string; pg: string; phd?: string; postDoc?: string;  
  };  
    
  externalIds: {  
    orcid?: string; scopusId?: string; scholarId?: string;  
    vidwanId?: string; linkedIn?: string;  
  };  
    
  photoUrl?: string;     // S3 pre-signed URL  
  profileCompleteness: number;  // 0-100  
    
  createdAt: string;  
  updatedAt: string;  
  status: 'active' | 'inactive' | 'on-leave';  
}

#### **Module 9: Research & Innovation**

This is the most complex faculty data module. Key features: DOI auto-fetch, duplicate detection, approval workflow trigger.  
typescript  
// packages/lambdas/research/handlers/add-publication.ts

export const handler \= async (event: APIGatewayProxyEvent) \=\> {  
  const { doi } \= JSON.parse(event.body\!);  
  const empId \= event.requestContext.authorizer?.claims\['custom:empId'\];  
    
  // Step 1: Fetch from CrossRef  
  const crossRefData \= await fetchFromCrossRef(doi);  
    
  // Step 2: Check duplicate  
  const existing \= await checkDuplicate(doi, empId);  
  if (existing) {  
    return {  
      statusCode: 409,  
      body: JSON.stringify({   
        conflict: true,   
        existing,          // Show side-by-side to user  
        new: crossRefData   
      })  
    };  
  }  
    
  // Step 3: Save as pending  
  const pubId \= ulid();  
  await savePublication({ pubId, empId, doi, ...crossRefData, status: 'pending' });  
    
  // Step 4: Fire EventBridge event → triggers approval workflow  
  await eventBridge.send(new PutEventsCommand({  
    Entries: \[{  
      Source: 'prajna.research',  
      DetailType: 'PublicationSubmitted',  
      Detail: JSON.stringify({ pubId, empId, doi, indexing: crossRefData.indexing }),  
    }\]  
  }));  
    
  return { statusCode: 201, body: JSON.stringify({ pubId, status: 'pending' }) };  
};

async function fetchFromCrossRef(doi: string) {  
  const res \= await fetch(\`https://api.crossref.org/works/${doi}\`);  
  const data \= await res.json();  
  const work \= data.message;  
  return {  
    title: work.title\[0\],  
    journal: work\['container-title'\]?.\[0\],  
    year: work.published?.\['date-parts'\]?.\[0\]?.\[0\],  
    authors: work.author?.map((a: any) \=\> \`${a.given} ${a.family}\`),  
    indexing: detectIndexing(work),   // SCI / Scopus / other  
    impactFactor: null,               // Fetch from Scopus API separately  
  };  
}  
---

### **Phase 3: Business Logic (Modules 13–18) — Weeks 4–7**

#### **Module 13: Approval Workflow Engine**

Use **AWS Step Functions** for multi-level approval with timeouts:  
typescript  
// State machine definition (CDK)  
const approvalWorkflow \= new sfn.StateMachine(this, 'ApprovalSM', {  
  definition: sfn.Chain  
    .start(new tasks.LambdaInvoke(this, 'NotifyLevel1', {  
      lambdaFunction: notifyHodFn,  
    }))  
    .next(new sfn.Wait(this, 'WaitForHoD', {  
      time: sfn.WaitTime.duration(Duration.days(3)),  
    }))  
    .next(new sfn.Choice(this, 'HoDActed?')  
      .when(sfn.Condition.stringEquals('$.status', 'approved'),  
        new tasks.LambdaInvoke(this, 'CheckEscalation', { ... }))  
      .when(sfn.Condition.stringEquals('$.status', 'rejected'),  
        new tasks.LambdaInvoke(this, 'NotifyRejection', { ... }))  
      .otherwise(  
        // Day 7: auto-escalate or auto-approve  
        new tasks.LambdaInvoke(this, 'EscalateOrAutoApprove', { ... })  
      )  
    )  
});

#### **Module 14: PRAJNA Score Engine**

typescript  
// Triggered via EventBridge on any data change  
export const recalculateScore \= async (event: EventBridgeEvent) \=\> {  
  const { empId } \= event.detail;  
    
  // Fetch all data in parallel  
  const \[teaching, research, fdp, achievements, admin, profile\] \=   
    await Promise.all(\[  
      getTeachingScore(empId),  
      getResearchScore(empId),  
      getFDPScore(empId),  
      getAchievementsScore(empId),  
      getAdminScore(empId),  
      getProfileCompleteness(empId),  
    \]);  
    
  const raw \= {  
    teaching:     teaching \* 0.25,  
    research:     research \* 0.30,  
    fdp:          fdp \* 0.20,  
    achievements: achievements \* 0.10,  
    admin:        admin \* 0.10,  
    profile:      profile \* 0.05,  
  };  
    
  const total \= Object.values(raw).reduce((a, b) \=\> a \+ b, 0);  
  const tier \= getTier(total);  
  // Bronze(0-40) Silver(41-60) Gold(61-80) Platinum(81-95) Fellow(96-100)  
    
  // Save score  
  await updateScore(empId, { total, breakdown: raw, tier });  
    
  // Fire event → leaderboard update  
  await eventBridge.send(new PutEventsCommand({  
    Entries: \[{   
      Source: 'prajna.score',  
      DetailType: 'ScoreUpdated',  
      Detail: JSON.stringify({ empId, total, tier })  
    }\]  
  }));  
};

// Research score calculation  
async function getResearchScore(empId: string): Promise\<number\> {  
  const pubs \= await getApprovedPublications(empId);  
    
  let score \= 0;  
  for (const pub of pubs) {  
    // Weighted by indexing type  
    if (pub.indexing \=== 'SCI') score \+= 15;  
    else if (pub.indexing \=== 'Scopus') score \+= 10;  
    else if (pub.indexing \=== 'conference') score \+= 5;  
    else score \+= 2;  
      
    // Bonus for high impact factor  
    if (pub.impactFactor \> 5) score \+= 5;  
  }  
    
  // Patents, grants, PhD scholars also add score  
  const patents \= await getPatents(empId);  
  score \+= patents.filter(p \=\> p.status \=== 'granted').length \* 20;  
  score \+= patents.filter(p \=\> p.status \=== 'filed').length \* 10;  
    
  return Math.min(score, 100); // Cap at 100  
}  
---

### **Phase 4: AI Companion (Modules 19–23) — Weeks 5–8**

#### **Module 20: AI Companion Chat**

typescript  
// Bedrock integration  
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const bedrock \= new BedrockRuntimeClient({ region: 'us-east-1' });

export const chat \= async (event: APIGatewayProxyEvent) \=\> {  
  const { message, conversationHistory } \= JSON.parse(event.body\!);  
  const empId \= event.requestContext.authorizer?.claims\['custom:empId'\];  
    
  // Get faculty context  
  const profile \= await getFacultyProfile(empId);  
  const score \= await getPrajnaScore(empId);  
  const pending \= await getPendingTasks(empId);  
    
  // Build system prompt with live faculty data  
  const systemPrompt \= buildSystemPrompt(profile, score, pending);  
    
  const response \= await bedrock.send(new InvokeModelCommand({  
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',  
    body: JSON.stringify({  
      anthropic\_version: 'bedrock-2023-05-31',  
      max\_tokens: 1024,  
      system: systemPrompt,  
      messages: \[  
        ...conversationHistory,  
        { role: 'user', content: message }  
      \],  
    }),  
    contentType: 'application/json',  
    accept: 'application/json',  
  }));  
    
  const result \= JSON.parse(new TextDecoder().decode(response.body));  
  const aiReply \= result.content\[0\].text;  
    
  // Save conversation (private to faculty only)  
  await saveConversation(empId, message, aiReply);  
    
  return { statusCode: 200, body: JSON.stringify({ reply: aiReply }) };  
};

function buildSystemPrompt(profile: any, score: any, pending: any\[\]): string {  
  return \`You are PRAJNA, a warm and encouraging professional AI companion for ${profile.name},   
a ${profile.designation} in the ${profile.department} department at GITAM University ${profile.campus}.

Current PRAJNA Score: ${score.total}/100 (${score.tier} tier)  
Score Breakdown: Teaching ${score.breakdown.teaching.toFixed(1)}, Research ${score.breakdown.research.toFixed(1)}, FDP ${score.breakdown.fdp.toFixed(1)}

Pending Tasks:  
${pending.map(t \=\> \`- ${t.title} (due: ${t.dueDate})\`).join('\\n')}

Your role:  
\- Be warm, specific, encouraging, and action-oriented  
\- Give personalized guidance based on their actual profile data  
\- Help them improve their PRAJNA score and career trajectory  
\- Suggest specific journals, conferences, and opportunities matching their research area  
\- This conversation is completely private — they can be open with you

Keep responses concise and actionable. Never be generic.\`;  
}

#### **Module 21: Morning Briefing**

typescript  
// CloudWatch Event → Lambda at 8 AM IST daily  
// IST \= UTC+5:30, so cron(30 2 \* \* ? \*) in UTC

const rule \= new events.Rule(this, 'MorningBriefingSchedule', {  
  schedule: events.Schedule.cron({   
    minute: '30', hour: '2'  // 8:00 AM IST  
  }),  
});

export const generateMorningBriefing \= async () \=\> {  
  // Get all active faculty across 3 campuses  
  const allFaculty \= await getAllActiveFaculty();  
    
  // Process in batches of 25 (Lambda concurrency)  
  for (const batch of chunk(allFaculty, 25)) {  
    await Promise.all(batch.map(faculty \=\> generateBriefingForFaculty(faculty)));  
  }  
};

async function generateBriefingForFaculty(faculty: FacultyBasic) {  
  const context \= await buildFacultyContext(faculty.empId);  
    
  const prompt \= \`Generate a personalized morning briefing for ${faculty.name}.  
Today is ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}.

Context:  
${JSON.stringify(context, null, 2)}

Generate a warm, specific 3-4 sentence briefing that:  
1\. Greets them by name  
2\. Lists their top 2-3 priorities for today (be specific)  
3\. Mentions one motivating insight about their progress  
4\. Ends with an energizing closer

Format as plain text, no markdown.\`;

  const briefing \= await callBedrock(prompt);  
    
  // Save to DynamoDB (faculty sees this on login)  
  await saveBriefing(faculty.empId, briefing);  
    
  // Push in-app notification  
  await notifyInApp(faculty.empId, 'Your morning briefing is ready\!');  
}  
---

### **Phase 5: Dashboards & Frontend (Modules 24–27) — Weeks 6–10**

#### **Frontend Architecture**

typescript  
// packages/frontend/src/App.tsx  
import { useAuth } from './hooks/useAuth';

function App() {  
  const { user, role, campus } \= useAuth();  
    
  // Route based on JWT role claim  
  const DashboardComponent \= {  
    'Faculty': FacultyDashboard,  
    'HoD': HoDDashboard,  
    'Director': DirectorDashboard,  
    'ProVC': ProVCDashboard,  
    'IQAC': IQACDashboard,  
    'Admin': AdminDashboard,  
  }\[role\] || Login;  
    
  return \<DashboardComponent /\>;  
}  
**Faculty Dashboard key sections:**  
┌─────────────────────────────────────────────┐  
│  Good morning, Dr. Priya\!  \[Morning Briefing\]│  
├──────────────┬──────────────────────────────┤  
│ PRAJNA Score │  Today's To-Do               │  
│   78/100     │  ☐ Mark attendance (CSE-301) │  
│   🥇 Gold    │  ☐ Submit FDP cert           │  
│   Rank: \#3   │  ☐ Review student feedback   │  
├──────────────┴──────────────────────────────┤  
│  AI Companion Chat                          │  
│  \[Ask me anything about your career...\]     │  
├─────────────────────────────────────────────┤  
│  Recent Activity  │  Pending Approvals      │  
└─────────────────────────────────────────────┤  
---

### **EventBridge Event Catalog**

All inter-module communication goes through EventBridge. Define event schemas upfront:  
typescript  
// All event types  
type PrajnaEventType \=  
  | 'PublicationSubmitted'    // research → approval workflow, notification  
  | 'PublicationApproved'     // approval → score engine, leaderboard, AI companion  
  | 'PublicationRejected'     // approval → notification, AI companion  
  | 'FDPSubmitted'            // fdp → approval workflow  
  | 'FDPAutoApproved'         // approval → score engine, notification  
  | 'ScoreUpdated'            // score engine → leaderboard  
  | 'LeaderboardUpdated'      // leaderboard → notification (rank change)  
  | 'APAROpened'              // system → all faculty  
  | 'APARSubmitted'           // faculty → hod notification  
  | 'APARApproved'            // approval → score, promotion check  
  | 'PromotionEligible'       // score → faculty notification, hod alert  
  | 'FeedbackScoreLow'        // feedback → hod alert  
  | 'ProfileIncomplete'       // system → faculty nudge  
  | 'DeadlineApproaching'     // system → faculty notification  
  | 'TaskCompleted'           // todo engine → AI companion, score  
---

### **API Endpoints Map**

Auth  
POST   /auth/login  
POST   /auth/logout  
POST   /auth/refresh

Faculty Profile  
GET    /faculty/profile  
PUT    /faculty/profile  
GET    /faculty/{empId}/profile   \[HoD/Director only\]

Research  
POST   /research/publications  
GET    /research/publications  
PUT    /research/publications/{pubId}  
GET    /research/doi-lookup?doi=

Approvals  
GET    /approvals/pending         \[HoD: own dept, Director: own school\]  
PUT    /approvals/{approvalId}/approve  
PUT    /approvals/{approvalId}/reject

AI Companion  
POST   /ai/chat  
GET    /ai/morning-briefing  
GET    /ai/end-of-day  
GET    /ai/todo

Leaderboard  
GET    /leaderboard/department  
GET    /leaderboard/school        \[Director only\]  
GET    /leaderboard/campus        \[Director only\]

Reports  
GET    /reports/naac  
GET    /reports/nirf  
GET    /reports/nba  
GET    /reports/faculty-summary  
POST   /reports/custom

Admin  
POST   /admin/faculty             \[create account\]  
GET    /admin/faculty             \[list all\]  
PUT    /admin/faculty/{empId}  
DELETE /admin/faculty/{empId}     \[deactivate only\]  
---

### **Development Workflow for Each Module**

Every student follows this for their module:  
Week 1–2:  Write LLD using template → get mentor approval  
Week 3–4:  CDK stack scaffolding → deploy to own dev account  
Week 5–6:  Lambda functions → unit tests  
Week 7–8:  Integration with shared modules → integration tests  
Week 9–10: Connect to frontend → E2E tests  
Week 11–12: UAT fixes → done  
**LLD sections to fill:**

1. Module Overview (what, why, who)  
2. Scope (in/out)  
3. Dependencies (which modules it needs, which need it)  
4. Architecture & Design \+ Data Flow  
5. Data Model (DynamoDB entities \+ access patterns)  
6. API Design (endpoints \+ error handling)  
7. Technology Choices (justify each)  
8. Security Considerations  
9. Testing Strategy  
10. CDK Infrastructure  
11. Risks & Mitigation  
12. Milestones per week  
13. Open Questions  
14. Amazon Leadership Principles self-assessment

---

### **Cost Summary (Dev Phase)**

| Tool | Cost | Action |
| ----- | ----- | ----- |
| **Claude Code Pro** | ₹1,852/student/month | Divyam Patro sets up Day 1 |
| **AWS** | \~₹0 (free tier per account) | Nava \+ Rushi setup AWS Org Day 1 |
| **Udemy CDK course** | ₹0 (14-day trial) | Dr. Kishore starts trial Day 1 |
| **Notion** | ₹0 (.edu email) | Apply Week 1 |
| **GitHub** | ₹0 (GitHub Education) | Apply Week 1 |
| **Total Recommended** | **\~₹1.66–1.81L for 3 months** |  |

### **Critical Path — What Must Happen In Order**

Module 1 (CDK Foundation)  
    ↓  
Module 2 (CI/CD) \+ Module 3 (Auth) \+ Module 5 (DB) \+ Module 6 (S3)  
    ↓  
Module 4 (API Gateway) \+ Module 19 (EventBridge)  
    ↓  
Modules 7–12 (Faculty Data) — parallel  
    ↓  
Module 13 (Approval WF) \+ Module 14 (Score Engine)  
    ↓  
Modules 15–18 (Leaderboard, Notifications, Reports, APAR)  
    ↓  
Modules 20–23 (AI Companion) — needs all faculty data  
    ↓  
Modules 24–27 (Dashboards) — frontend  
    ↓  
Modules 28–30 (Security, Monitoring, Migration)  
    ↓  
UAT → Go-Live  
---

What module are you assigned to, or which one do you want to start building first? I'll go full LLD \+ code for it.  
You are out of free [messages](https://support.claude.com/en/articles/11647753-understanding-usage-and-length-limits) until 11:20 PM  
lite read the total docs i uploaded for the project and understand everything about the project  
✨ Optimize Prompt

[Claude is AI and can make mistakes. Please double-check responses.](https://support.anthropic.com/en/articles/8525154-claude-is-providing-incorrect-or-misleading-responses-what-s-going-on)

