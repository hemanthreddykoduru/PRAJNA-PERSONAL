const { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand, AdminAddUserToGroupCommand } = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient({ region: "us-east-1" });
const USER_POOL_ID = "us-east-1_lxxysDfi1";

const users = [
  { email: "hemanth.reddyk@gitam.edu", role: "Faculty", name: "Hemanth Reddy" },
  { email: "hod@gitam.edu", role: "HoD", name: "Dept Head" },
  { email: "director@gitam.edu", role: "Director", name: "School Director" },
  { email: "provc@gitam.edu", role: "ProVC", name: "Pro Vice-Chancellor" },
  { email: "iqac@gitam.edu", role: "IQAC", name: "IQAC Auditor" },
  { email: "admin@gitam.edu", role: "Admin", name: "System Admin" }
];

async function provision() {
  for (const user of users) {
    try {
      console.log(`Creating ${user.role}: ${user.email}...`);
      
      // 1. Create User
      await client.send(new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: user.email,
        UserAttributes: [
          { Name: "email", Value: user.email },
          { Name: "email_verified", Value: "true" },
          { Name: "name", Value: user.name },
          { Name: "custom:campus", Value: "Bengaluru" },
          { Name: "custom:department", Value: "CSE" }
        ],
        MessageAction: "SUPPRESS"
      }));

      // 2. Set Password
      await client.send(new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: user.email,
        Password: "PrajnaPassword123!",
        Permanent: true
      }));

      // 3. Add to Group
      await client.send(new AdminAddUserToGroupCommand({
        UserPoolId: USER_POOL_ID,
        Username: user.email,
        GroupName: user.role
      }));

      console.log(`✅ ${user.role} provisioned successfully.`);
    } catch (err) {
      console.error(`❌ Failed for ${user.email}:`, err.message);
    }
  }
}

provision();
