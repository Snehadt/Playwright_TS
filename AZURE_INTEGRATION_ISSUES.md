# Azure Playwright Testing Integration - Issues & Solutions

This document captures all issues encountered during the integration of Playwright tests with Microsoft Playwright Testing (Azure) and their solutions.

---

## Quick Solutions Summary

| Issue | Solution |
|-------|----------|
| Azure CLI not in PATH | `export PATH="/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin:$PATH"` |
| Login failed | Use `az login --use-device-code` |
| Role assignment failed via CLI | Use Azure Portal: Storage Account → IAM → Add role assignment |
| Local auth disabled | Enable via `az rest --method patch` with `{"properties":{"localAuth":"Enabled"}}` |
| Wrong token type | Get token from Azure Portal → Playwright Workspace → Get Started |
| DefaultAzureCredential failed | Use access token with direct `connectOptions` config |
| Module import error | Import from `@azure/playwright` not `@azure/playwright/testing` |
| Config syntax errors | Use simple config with `connectOptions` object |
| TypeScript type errors | Use non-null assertion: `process.env.PLAYWRIGHT_SERVICE_URL!` |

---

## Issue #1: Azure CLI Not in PATH

**Problem:**
```bash
az: command not found
```

**Root Cause:**
Azure CLI installed from company portal but not added to bash PATH.

**Solution:**
```bash
export PATH="/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin:$PATH"
az --version
```

**Permanent Fix:**
Add to `~/.bashrc` or `~/.bash_profile`:
```bash
export PATH="/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin:$PATH"
```

---

## Issue #2: Azure CLI Login Authentication Failed

**Problem:**
Browser-based `az login` was blocked or didn't work properly in corporate environment.

**Solution:**
Use device code authentication flow:
```bash
az login --use-device-code
```

This provides a code to enter at https://login.microsoft.com/device, which works better with corporate security policies.

---

## Issue #3: Role Assignment - MissingSubscription Error

**Problem:**
```
ERROR: (MissingSubscription) The request did not have a subscription or a valid tenant level resource provider.
```

**Attempted Solutions (that failed):**
```bash
# Using subscription ID as assignee - WRONG
az role assignment create --assignee "40070426-7030-47a6-a060-d07a88c35ecf" ...

# Using email directly - FAILED
az role assignment create --assignee "snehadt7@gmail.com" ...

# Using user principal name - FAILED
az role assignment create --assignee "snehadt7_gmail.com#EXT#@snehadt7gmail.onmicrosoft.com" ...
```

**Root Cause:**
- Subscription ID was used instead of user object ID
- Azure CLI authentication token had expired or had permission issues

**Solution:**
1. Get correct user object ID:
```bash
az ad signed-in-user show --query id -o tsv
# Output: 590c2036-408c-4a20-abd2-8c1acd21437a
```

2. Assign role via **Azure Portal** instead of CLI (more reliable):
   - Navigate to Storage Account → Access Control (IAM)
   - Add role assignment → Storage Blob Data Contributor
   - Select user by email

---

## Issue #4: Local Authentication Disabled on Playwright Workspace

**Problem:**
```
"localAuth": "Disabled"
```

Playwright workspace was configured for Entra ID authentication only, requiring Azure AD credentials.

**Solution:**
Enable local authentication to use access tokens:
```bash
az rest --method patch \
  --url "https://management.azure.com/subscriptions/{subscription}/resourceGroups/{resourceGroup}/providers/Microsoft.LoadTestService/playwrightworkspaces/{workspace}?api-version=2026-02-01-preview" \
  --body '{"properties":{"localAuth":"Enabled"}}'
```

**Result:**
```json
{
  "properties": {
    "localAuth": "Enabled",
    "reporting": "Enabled",
    "storageUri": "https://pwstrgmyresource3558.blob.core.windows.net"
  }
}
```

---

## Issue #5: Wrong Access Token Type

**Problem:**
Used Azure Management API token instead of Playwright Service token.

**Wrong Token:**
```bash
# This gives Azure Management token, NOT Playwright service token
az account get-access-token --resource https://management.azure.com
```

**Correct Solution:**
Get token from Azure Portal:
1. Navigate to Playwright workspace → **Get Started**
2. Copy the access token from the PowerShell command:
```powershell
$env:PLAYWRIGHT_SERVICE_ACCESS_TOKEN="eyJhbGci..."
```

---

## Issue #6: DefaultAzureCredential Authentication Failures

**Problem:**
```
Error: Could not authenticate with the service.
```

**Root Cause:**
- `DefaultAzureCredential` requires Entra ID authentication
- Azure CLI credentials weren't recognized by the Playwright SDK
- Conflicts between Entra ID and local auth modes

**Failed Config:**
```typescript
import { DefaultAzureCredential } from '@azure/identity';
import { createAzurePlaywrightConfig } from '@azure/playwright';

export default defineConfig(
  config,
  createAzurePlaywrightConfig(config, {
    credential: new DefaultAzureCredential(), // ❌ Failed
  })
);
```

**Solution:**
Use access token authentication instead of Entra ID.

---

## Issue #7: Module Import Errors

**Problem 1:**
```typescript
import { getConnectOptions } from '@azure/playwright/testing';
// Error: Cannot find module '@azure/playwright/testing'
```

**Solution:**
```typescript
import { getConnectOptions } from '@azure/playwright'; // ✅ Correct
```

**Problem 2:**
`getConnectOptions()` returns a Promise, causing TypeScript errors:
```
Type 'Promise<BrowserConnectOptions>' has no properties in common with type 'PlaywrightTestConfig'
```

---

## Issue #8: Config File Syntax Errors

**Problem:**
After multiple edits, leftover code fragments caused syntax errors:
```typescript
export default defineConfig(config, getConnectOptions());
  {  // ❌ Orphaned block
    // reporter config
  }
);
```

**Solution:**
Complete rewrite of config file with proper structure.

---

## Issue #9: TypeScript Type Errors with connectOptions

**Problem:**
```typescript
connectOptions: {
  wsEndpoint: process.env.PLAYWRIGHT_SERVICE_URL, // ❌ Type 'string | undefined'
}
```

**Error:**
```
Property 'wsEndpoint' is missing in type 'Promise<BrowserConnectOptions>'
```

**Solution:**
Use non-null assertion operator:
```typescript
connectOptions: {
  wsEndpoint: process.env.PLAYWRIGHT_SERVICE_URL!, // ✅
  headers: {
    'x-mpt-access-key': process.env.PLAYWRIGHT_SERVICE_ACCESS_TOKEN!,
  },
}
```

---

## Final Working Configuration

### `.env` file:
```bash
# Azure Playwright Service
PLAYWRIGHT_SERVICE_URL=wss://eastasia.api.playwright.microsoft.com/playwrightworkspaces/4247ea18-110c-4652-b24a-5eef04f21c32/browsers
PLAYWRIGHT_SERVICE_ACCESS_TOKEN=eyJhbGci...
```

### `playwright.service.config.ts`:
```typescript
import { defineConfig } from '@playwright/test';
import config from './playwright.config';

export default defineConfig(config, {
  use: {
    connectOptions: {
      wsEndpoint: process.env.PLAYWRIGHT_SERVICE_URL!,
      timeout: 3 * 60 * 1000,
      headers: {
        'x-mpt-access-key': process.env.PLAYWRIGHT_SERVICE_ACCESS_TOKEN!,
      },
      exposeNetwork: '<loopback>',
    },
  },
});
```

### Run Command:
```bash
npx playwright test --config=playwright.service.config.ts --workers=10
```

---

## Required Azure Setup Steps

### 1. Enable Local Authentication
```bash
az rest --method patch \
  --url "https://management.azure.com/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.LoadTestService/playwrightworkspaces/{workspace}?api-version=2026-02-01-preview" \
  --body '{"properties":{"localAuth":"Enabled"}}'
```

### 2. Assign Storage Blob Data Contributor Role
Via Azure Portal:
- Storage Account → Access Control (IAM)
- Add role assignment → Storage Blob Data Contributor
- Select members → Add your user account

### 3. Configure CORS for Trace Viewer
Storage Account → Settings → Resource sharing (CORS):
- **Allowed origins:** `https://trace.playwright.dev`
- **Allowed methods:** GET, OPTIONS
- **Max age:** 86400

### 4. Get Access Token
Azure Portal → Playwright Workspace → Get Started → Copy token

---

## Key Learnings

1. **Use Azure Portal for role assignments** - More reliable than CLI in corporate environments
2. **Local auth vs Entra ID** - Local auth with access tokens is simpler for local development
3. **Access token location** - Found in "Get Started" section of Playwright workspace
4. **Direct connection config** - Simpler than using SDK helper functions that require async resolution
5. **Device code auth** - Best option for corporate environments with strict security policies

---

## Testing in CI/CD (Azure Pipelines)

For Azure Pipelines, add the access token as a **secret variable**:

1. Pipeline → Edit → Variables
2. Add variable:
   - Name: `PLAYWRIGHT_SERVICE_ACCESS_TOKEN`
   - Value: (your token)
   - ✅ Keep this value secret

The pipeline will automatically use environment variables for authentication.

---

## Useful Commands

```bash
# Check Azure login status
az account show

# List role assignments for user
az role assignment list --assignee "user-object-id" --all -o table

# Get Playwright workspace details
az resource show --resource-group MyResource \
  --name PlaywrightWithAzure \
  --resource-type "Microsoft.LoadTestService/playwrightworkspaces"

# List Playwright tests
npx playwright test --config=playwright.service.config.ts --list

# Run specific tests on Azure
npx playwright test --config=playwright.service.config.ts --grep "@api" --workers=10
```

---

## Related Documentation

- [Microsoft Playwright Testing Docs](https://aka.ms/pww/docs)
- [Authentication Guide](https://aka.ms/pww/docs/authentication)
- [Azure CLI Reference](https://learn.microsoft.com/cli/azure/)
- [Storage Blob Data Contributor Role](https://learn.microsoft.com/azure/role-based-access-control/built-in-roles#storage-blob-data-contributor)

---

## Complete Solutions Checklist

### ✅ Step-by-Step Setup Guide

#### 1. Install and Configure Azure CLI
```bash
# Add Azure CLI to PATH (Windows Git Bash)
export PATH="/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin:$PATH"

# Verify installation
az --version

# Login with device code (works best in corporate environments)
az login --use-device-code
# Follow the instructions to authenticate at https://login.microsoft.com/device
```

#### 2. Enable Local Authentication on Playwright Workspace
```bash
# Replace placeholders with your values
az rest --method patch \
  --url "https://management.azure.com/subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/YOUR_RESOURCE_GROUP/providers/Microsoft.LoadTestService/playwrightworkspaces/YOUR_WORKSPACE_NAME?api-version=2026-02-01-preview" \
  --body '{"properties":{"localAuth":"Enabled"}}'

# Verify it's enabled
az resource show \
  --resource-group YOUR_RESOURCE_GROUP \
  --name YOUR_WORKSPACE_NAME \
  --resource-type "Microsoft.LoadTestService/playwrightworkspaces" \
  --query "properties.localAuth"
```

#### 3. Assign Storage Blob Data Contributor Role
**Via Azure Portal (Recommended):**
1. Go to https://portal.azure.com
2. Navigate to your storage account (e.g., `pwstrgmyresource3558`)
3. Click **Access Control (IAM)** in left menu
4. Click **+ Add** → **Add role assignment**
5. Select **Storage Blob Data Contributor** → Click **Next**
6. Click **+ Select members**
7. Search for your email and select it
8. Click **Review + assign**

**Via CLI (if portal doesn't work):**
```bash
# Get your user object ID
USER_OBJECT_ID=$(az ad signed-in-user show --query id -o tsv)
echo "User Object ID: $USER_OBJECT_ID"

# Assign role (may fail with MissingSubscription error)
az role assignment create \
  --assignee "$USER_OBJECT_ID" \
  --role "Storage Blob Data Contributor" \
  --scope "/subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/YOUR_RESOURCE_GROUP/providers/Microsoft.Storage/storageAccounts/YOUR_STORAGE_ACCOUNT"
```

#### 4. Configure CORS for Trace Viewer
**Via Azure Portal:**
1. Go to your storage account
2. Navigate to **Settings** → **Resource sharing (CORS)**
3. Under **Blob service**, add a new rule:
   - **Allowed origins:** `https://trace.playwright.dev`
   - **Allowed methods:** ☑️ GET, ☑️ OPTIONS
   - **Allowed headers:** `*`
   - **Exposed headers:** `*`
   - **Max age:** `86400`
4. Click **Save**

#### 5. Get Access Token from Azure Portal
1. Go to https://portal.azure.com
2. Search for your Playwright workspace (e.g., `PlaywrightWithAzure`)
3. Click on it
4. In the left menu, click **Get Started**
5. Copy the PowerShell command that looks like:
   ```powershell
   $env:PLAYWRIGHT_SERVICE_ACCESS_TOKEN="eyJhbGci..."
   ```
6. Extract the token value (the part in quotes after the `=`)

#### 6. Update `.env` File
```bash
# Add these to your .env file
PLAYWRIGHT_SERVICE_URL=wss://YOUR_REGION.api.playwright.microsoft.com/playwrightworkspaces/YOUR_WORKSPACE_ID/browsers
PLAYWRIGHT_SERVICE_ACCESS_TOKEN=YOUR_ACCESS_TOKEN_HERE
```

**Example:**
```bash
PLAYWRIGHT_SERVICE_URL=wss://eastasia.api.playwright.microsoft.com/playwrightworkspaces/4247ea18-110c-4652-b24a-5eef04f21c32/browsers
PLAYWRIGHT_SERVICE_ACCESS_TOKEN=eyJhbGciOiJSUzI1NiIsImtpZCI6ImI2OGUzMTIyOTNiNDQ1YTY5ZjBlYWZiMzQ4MjdhZDVmIiwidHlwIjoiSldUIn0...
```

#### 7. Create/Update `playwright.service.config.ts`
```typescript
import { defineConfig } from '@playwright/test';
import config from './playwright.config';

/* Azure Playwright Testing Configuration */
export default defineConfig(config, {
  use: {
    connectOptions: {
      wsEndpoint: process.env.PLAYWRIGHT_SERVICE_URL!,
      timeout: 3 * 60 * 1000, // 3 minutes
      headers: {
        'x-mpt-access-key': process.env.PLAYWRIGHT_SERVICE_ACCESS_TOKEN!,
      },
      exposeNetwork: '<loopback>',
    },
  },
});
```

#### 8. Test the Configuration
```bash
# List tests to verify config loads
npx playwright test --config=playwright.service.config.ts --list

# Run a small subset of tests
npx playwright test --config=playwright.service.config.ts --grep "@api" --workers=5

# Run all tests on Azure
npx playwright test --config=playwright.service.config.ts --workers=10
```

---

## Troubleshooting Guide

### Problem: Tests run locally instead of on Azure
**Check:**
1. Verify `.env` file has correct `PLAYWRIGHT_SERVICE_URL` and `PLAYWRIGHT_SERVICE_ACCESS_TOKEN`
2. Check that `playwright.service.config.ts` uses `connectOptions` correctly
3. Ensure you're using the service config: `--config=playwright.service.config.ts`

### Problem: "Could not authenticate with the service"
**Solutions:**
1. Verify access token is correct and not expired
2. Ensure local auth is enabled on workspace
3. Get a fresh token from Azure Portal → Workspace → Get Started

### Problem: "Test run creation failed during setup"
**Solutions:**
1. Check Storage Blob Data Contributor role is assigned
2. Verify reporting is enabled on workspace
3. Ensure storage account is linked to workspace

### Problem: Azure CLI commands fail with MissingSubscription
**Solutions:**
1. Re-login: `az login --use-device-code`
2. Set subscription: `az account set --subscription YOUR_SUBSCRIPTION_ID`
3. Use Azure Portal instead for role assignments

### Problem: Module import errors in TypeScript
**Solutions:**
1. Use `@azure/playwright` not `@azure/playwright/testing`
2. Don't use `getConnectOptions()` - use direct `connectOptions` object
3. Use non-null assertions (`!`) for environment variables

---

## Verification Steps

After completing all setup steps, verify everything works:

```bash
# 1. Check Azure CLI is working
az account show

# 2. Check workspace is configured correctly
az resource show \
  --resource-group YOUR_RESOURCE_GROUP \
  --name YOUR_WORKSPACE_NAME \
  --resource-type "Microsoft.LoadTestService/playwrightworkspaces" \
  --query "properties"

# Expected output:
# {
#   "localAuth": "Enabled",
#   "reporting": "Enabled",
#   "storageUri": "https://YOUR_STORAGE.blob.core.windows.net",
#   ...
# }

# 3. Verify environment variables are loaded
node -e "require('dotenv').config(); console.log('URL:', process.env.PLAYWRIGHT_SERVICE_URL?.substring(0, 50) + '...'); console.log('Token:', process.env.PLAYWRIGHT_SERVICE_ACCESS_TOKEN?.substring(0, 20) + '...');"

# 4. Run a test
npx playwright test --config=playwright.service.config.ts --grep "@api" --workers=2
```

---

## Azure Pipelines CI/CD Setup

### `azure-pipelines.yml`
```yaml
trigger:
  branches:
    include:
      - main
      - develop

pool:
  vmImage: 'ubuntu-latest'

variables:
  - name: NODE_VERSION
    value: '20.x'
  - name: PLAYWRIGHT_SERVICE_URL
    value: 'wss://eastasia.api.playwright.microsoft.com/playwrightworkspaces/YOUR_WORKSPACE_ID/browsers'

steps:
  - task: NodeTool@0
    displayName: 'Install Node.js'
    inputs:
      versionSpec: '$(NODE_VERSION)'

  - script: npm ci
    displayName: 'Install dependencies'

  - script: |
      export PLAYWRIGHT_SERVICE_URL="$(PLAYWRIGHT_SERVICE_URL)"
      export PLAYWRIGHT_SERVICE_ACCESS_TOKEN="$(PLAYWRIGHT_SERVICE_ACCESS_TOKEN)"
      npx playwright test --config=playwright.service.config.ts --workers=10
    displayName: 'Run Playwright Tests on Azure'
    env:
      PLAYWRIGHT_SERVICE_ACCESS_TOKEN: $(PLAYWRIGHT_SERVICE_ACCESS_TOKEN)
```

### Add Secret Variable in Azure DevOps:
1. Go to your pipeline
2. Click **Edit** → **Variables**
3. Click **+ New variable**
4. Name: `PLAYWRIGHT_SERVICE_ACCESS_TOKEN`
5. Value: (paste your token)
6. ✅ **Keep this value secret**
7. Click **OK** → **Save**

---

## Common Mistakes to Avoid

❌ **Don't** use subscription ID as assignee in role assignment  
✅ **Do** use user object ID or assign via Portal

❌ **Don't** use Azure Management token  
✅ **Do** use Playwright service token from Portal

❌ **Don't** use `DefaultAzureCredential` for local development  
✅ **Do** use access token authentication

❌ **Don't** forget to enable local auth on workspace  
✅ **Do** enable it before trying to use access tokens

❌ **Don't** use `getConnectOptions()` directly in config  
✅ **Do** use `connectOptions` object with explicit properties

❌ **Don't** commit access tokens to git  
✅ **Do** use `.env` file (which should be in `.gitignore`)

---

---

## Issue #10: Test Results Not Visible in Azure DevOps Tests Tab

**Problem:**
Tests were running successfully in Microsoft Playwright Testing Service (visible in browser sessions), but test results were not appearing in Azure DevOps Tests tab.

**Root Cause:**
1. **Missing Azure DevOps Organization/Project** - Tests tab requires Azure DevOps infrastructure
2. **Missing blob reporter** - Required for Microsoft Playwright Testing to publish results
3. **Missing JUnit reporter** - Required for Azure DevOps PublishTestResults task
4. **Tests running locally** - Local test runs don't create Azure DevOps test runs (missing build context)

**Session Information (Local Run):**
```
Source Type: Others
Source ID: Empty-RunId  ← No connection to Azure DevOps
```

**Initial Misunderstandings:**
- Believed JUnit XML files alone would make tests visible (incorrect)
- Thought local runs would show in Azure DevOps (incorrect - needs pipeline context)
- Confused Microsoft Playwright Testing portal with Azure DevOps portal

### Solution Steps:

#### 1. Add blob Reporter to Service Config
Updated `playwright.service.config.ts`:
```typescript
reporter: [
  ['list'],
  ['html', { outputFolder: 'playwright-report' }],
  ['junit', { outputFile: 'test-results/junit.xml' }],
  ['blob'], // ✅ Required for Microsoft Playwright Testing reporting
  ['allure-playwright', {
    detail: true,
    outputFolder: 'allure-results',
    suiteTitle: false,
  }],
],
```

#### 2. Set Up Azure DevOps Organization and Project
**Steps:**
1. Navigate to https://dev.azure.com (NOT portal.azure.com)
2. Create new organization (e.g., "playwright-testing")
3. Create new project (e.g., "PlaywrightTests")
4. Go to **Pipelines** → **Create Pipeline**

#### 3. Connect GitHub Repository to Azure Pipelines
**Steps:**
1. In Azure DevOps Pipelines, click **New Pipeline**
2. Select **GitHub** as source
3. Approve and install Azure Pipelines app on GitHub
4. Select repository: `Snehadt/Playwright_TS`
5. Choose "Existing Azure Pipelines YAML file"
6. Select `/azure-pipelines.yml`

#### 4. Configure Pipeline Secret Variables
**Steps:**
1. Before first run, click **Variables** (top right)
2. Add new variable:
   - **Name:** `PLAYWRIGHT_SERVICE_ACCESS_TOKEN`
   - **Value:** (your token from Playwright workspace)
   - **✅ Keep this value secret**
3. Click **OK** → **Save**

---

## Issue #11: Azure Pipeline Agent Not Found Error

**Problem:**
```
##[error]No agent found in pool Azure Pipelines which satisfies the specified demands: 
Agent.Version -gtVersion 2.199.0
```

**Root Cause:**
Initially thought it was a Microsoft-hosted agents access issue, but the organization had 1800 free minutes available. The actual issue was the pool configuration needed explicit pool name.

**Check Performed:**
- Organization Settings → Pipelines → Parallel jobs
- Showed: "Currently 0/1800 minutes consumed" ✅
- Microsoft-hosted parallel jobs were already enabled

**Solution:**
Updated `azure-pipelines.yml` pool configuration:
```yaml
# Before (failed)
pool:
  vmImage: 'ubuntu-latest'

# After (works)
pool:
  name: 'Azure Pipelines'
  vmImage: 'ubuntu-latest'
```

**Why This Works:**
Adding explicit `name: 'Azure Pipelines'` helps Azure DevOps properly resolve the Microsoft-hosted agent pool.

---

## Complete Azure DevOps Tests Tab Setup Guide

### What You Need:

**Three Separate Components:**
1. **Microsoft Playwright Testing Service** - Cloud browsers for test execution
2. **Azure DevOps Organization + Project** - Infrastructure for test result reporting
3. **Azure Pipeline** - Connects GitHub repo, runs tests, publishes results

### Architecture Flow:
```
GitHub Push 
  → Azure Pipeline Triggered
  → Pipeline runs: npx playwright test --config=playwright.service.config.ts
  → Tests execute on Microsoft Playwright Testing cloud browsers
  → blob reporter sends results to Azure DevOps
  → PublishTestResults task publishes JUnit XML
  → Results visible in Azure DevOps Tests Tab
```

### Complete Setup Checklist:

#### ✅ Part 1: Playwright Service Configuration
- [x] Enable local auth on Playwright workspace
- [x] Assign Storage Blob Data Contributor role
- [x] Get access token from Azure Portal
- [x] Add token to `.env` file
- [x] Create `playwright.service.config.ts` with `connectOptions`
- [x] Add blob reporter for Azure DevOps integration
- [x] Add JUnit reporter for test result publishing

#### ✅ Part 2: Azure DevOps Setup
- [x] Create Azure DevOps organization (https://dev.azure.com)
- [x] Create project within organization
- [x] Navigate to Pipelines section
- [x] Connect GitHub repository
- [x] Approve Azure Pipelines GitHub app installation

#### ✅ Part 3: Azure Pipeline Configuration
- [x] Create `azure-pipelines.yml` in repository root
- [x] Configure pool with explicit name
- [x] Add PLAYWRIGHT_SERVICE_URL variable
- [x] Add PLAYWRIGHT_SERVICE_ACCESS_TOKEN as secret variable
- [x] Include PublishTestResults@2 task for JUnit XML
- [x] Commit and push YAML file to trigger pipeline

#### ✅ Part 4: Verification
- [x] Pipeline runs successfully
- [x] Tests execute on cloud browsers
- [x] Test results appear in Tests tab
- [x] Can drill down into individual test failures

---

## Key Differences: Portal vs Local Testing

### Local Test Run (`npx playwright test --config=playwright.service.config.ts`)
- ✅ Tests run on Microsoft Playwright Testing cloud browsers
- ✅ Browser session visible in Playwright portal
- ❌ No test run entry in Azure DevOps
- ❌ No test results in Tests tab
- ❌ Missing build context (Build.BuildId, etc.)
- **Use Case:** Quick development testing, debugging individual tests

### Azure Pipeline Run (via azure-pipelines.yml)
- ✅ Tests run on Microsoft Playwright Testing cloud browsers
- ✅ Browser session visible in Playwright portal
- ✅ Test run created in Azure DevOps
- ✅ Test results published to Tests tab
- ✅ Full build context available
- ✅ Integrated with CI/CD workflow
- **Use Case:** Production testing, PR validation, test result tracking

---

## Final Working Azure Pipeline Configuration

### `azure-pipelines.yml`:
```yaml
trigger:
  branches:
    include:
      - main
      - develop

pool:
  name: 'Azure Pipelines'  # ← Explicit pool name required
  vmImage: 'ubuntu-latest'

variables:
  - name: NODE_VERSION
    value: '20.x'
  - name: PLAYWRIGHT_SERVICE_URL
    value: 'wss://eastasia.api.playwright.microsoft.com/playwrightworkspaces/4247ea18-110c-4652-b24a-5eef04f21c32/browsers'

stages:
  - stage: Test
    displayName: 'Run Playwright Tests'
    jobs:
      - job: PlaywrightTests
        displayName: 'Execute Playwright Test Suite'
        timeoutInMinutes: 60
        
        steps:
          - task: NodeTool@0
            displayName: 'Install Node.js $(NODE_VERSION)'
            inputs:
              versionSpec: '$(NODE_VERSION)'
          
          - script: npm ci
            displayName: 'Install npm dependencies'
          
          - script: npx playwright install --with-deps chromium
            displayName: 'Install Playwright browsers'
          
          - script: |
              export PLAYWRIGHT_SERVICE_URL="$(PLAYWRIGHT_SERVICE_URL)"
              export CI=true
              npx playwright test --config=playwright.service.config.ts --workers=10
            displayName: 'Run Playwright Tests on Azure'
            env:
              PLAYWRIGHT_SERVICE_URL: $(PLAYWRIGHT_SERVICE_URL)
              PLAYWRIGHT_SERVICE_ACCESS_TOKEN: $(PLAYWRIGHT_SERVICE_ACCESS_TOKEN)
            continueOnError: true
          
          # ← This task makes test results visible in Tests tab
          - task: PublishTestResults@2
            displayName: 'Publish Test Results'
            condition: succeededOrFailed()
            inputs:
              testResultsFormat: 'JUnit'
              testResultsFiles: '**/test-results/**/*.xml'
              mergeTestResults: true
              failTaskOnFailedTests: true
              testRunTitle: 'Playwright Tests - $(Build.BuildNumber)'
          
          - task: PublishPipelineArtifact@1
            displayName: 'Publish Playwright HTML Report'
            condition: succeededOrFailed()
            inputs:
              targetPath: 'playwright-report'
              artifact: 'playwright-report-$(System.JobAttempt)'
              publishLocation: 'pipeline'
```

### `playwright.service.config.ts`:
```typescript
import { defineConfig } from '@playwright/test';
import config from './playwright.config';

export default defineConfig(config, {
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],  // For PublishTestResults task
    ['blob'],  // For Microsoft Playwright Testing reporting to Azure DevOps
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: false,
    }],
  ],
  use: {
    connectOptions: {
      wsEndpoint: process.env.PLAYWRIGHT_SERVICE_URL!,
      timeout: 3 * 60 * 1000,
      headers: {
        'x-mpt-access-key': process.env.PLAYWRIGHT_SERVICE_ACCESS_TOKEN!,
      },
      exposeNetwork: '<loopback>',
    },
  },
});
```

---

## Lessons Learned - Azure DevOps Integration

### Key Insights:
1. **Three separate services work together:**
   - Microsoft Playwright Testing (cloud browsers)
   - Azure DevOps (test result reporting infrastructure)
   - Azure Pipelines (orchestration and CI/CD)

2. **Local runs ≠ Azure DevOps test runs:**
   - Local: Quick testing, no Azure DevOps integration
   - Pipeline: Full integration, test results tracking, CI/CD

3. **blob reporter is critical:**
   - Not documented clearly in many guides
   - Required for Microsoft Playwright Testing → Azure DevOps reporting
   - Works alongside JUnit reporter (not instead of)

4. **Portal confusion:**
   - portal.azure.com = Azure resources (storage, workspaces)
   - dev.azure.com = Azure DevOps (pipelines, test results)
   - playwright.microsoft.com = Browser sessions viewer

5. **Pool configuration matters:**
   - Explicit `name: 'Azure Pipelines'` helps with agent resolution
   - Even when parallel jobs are available, pool config can cause issues

6. **Test visibility requires multiple reporters:**
   - blob reporter → Microsoft Playwright Testing integration
   - JUnit reporter → Azure DevOps Tests tab via PublishTestResults
   - Both are needed for complete visibility

---

**Document Created:** 2026-05-25  
**Last Updated:** 2026-05-25 (Added Issues #10, #11 and Azure DevOps integration)  
**Author:** Integration Team
