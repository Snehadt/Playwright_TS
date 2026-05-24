# Login Test Tags Guide

## 📋 Tag Categories

### **Functional Tests**
| Tag | Purpose | Count |
|-----|---------|-------|
| `@smoke` | Quick sanity checks for critical functionality | 2 |
| `@critical` | Must-pass tests for core features | 2 |
| `@happy-path` | Successful user flow scenarios | 1 |
| `@negative` | Failure/error scenarios | 1 |
| `@validation` | Input validation tests | 1 |
| `@edge-case` | Boundary conditions | 1 |
| `@ui` | User interface rendering tests | 1 |

### **Security Tests**
| Tag | Purpose | Count |
|-----|---------|-------|
| `@security` | All security-related tests | 7 |
| `@sql-injection` | SQL injection attack prevention | 1 |
| `@xss` | Cross-site scripting protection | 1 |
| `@tampering` | Response integrity validation | 1 |
| `@mitm` | Man-in-the-middle attack detection | 1 |
| `@rate-limit` | Rate limiting / throttling tests | 1 |
| `@brute-force` | Brute force attack prevention | 1 |
| `@https` | Secure protocol enforcement | 1 |
| `@compliance` | Security compliance checks | 1 |
| `@data-exposure` | Sensitive data protection | 1 |
| `@privacy` | Privacy-related validations | 1 |
| `@jwt` | Token authentication tests | 1 |
| `@authentication` | Auth mechanism validation | 1 |
| `@owasp` | OWASP Top 10 security tests | 2 |

---

## 🚀 How to Run Tests by Tags

### **Run Smoke Tests Only** (Fast)
```bash
npx playwright test LoginPage.spec.ts --grep "@smoke"
```

### **Run Critical Tests** (Must-pass for CI/CD)
```bash
npx playwright test LoginPage.spec.ts --grep "@critical"
```

### **Run All Security Tests**
```bash
npx playwright test LoginPage.spec.ts --grep "@security"
```

### **Run Specific Security Test**
```bash
# SQL Injection tests
npx playwright test LoginPage.spec.ts --grep "@sql-injection"

# XSS tests
npx playwright test LoginPage.spec.ts --grep "@xss"

# Rate limiting tests
npx playwright test LoginPage.spec.ts --grep "@rate-limit"
```

### **Run OWASP Security Tests**
```bash
npx playwright test LoginPage.spec.ts --grep "@owasp"
```

### **Exclude Security Tests** (Run functional only)
```bash
npx playwright test LoginPage.spec.ts --grep-invert "@security"
```

### **Combine Tags** (AND logic)
```bash
# Run smoke tests that are also critical
npx playwright test LoginPage.spec.ts --grep "@smoke.*@critical"
```

### **Multiple Tags** (OR logic)
```bash
# Run either smoke OR critical tests
npx playwright test LoginPage.spec.ts --grep "@smoke|@critical"
```

---

## 📊 Recommended Test Execution Strategies

### **1. CI/CD Pipeline - Fast Feedback**
```bash
# Run only smoke tests (< 1 minute)
npx playwright test --grep "@smoke"
```

### **2. Pre-Merge Validation**
```bash
# Run critical tests before merging PR
npx playwright test --grep "@critical"
```

### **3. Nightly Security Scan**
```bash
# Run all security tests overnight
npx playwright test --grep "@security"
```

### **4. Full Regression Suite**
```bash
# Run everything
npx playwright test LoginPage.spec.ts
```

### **5. Compliance Audit**
```bash
# Run compliance-related tests for auditors
npx playwright test --grep "@compliance|@privacy|@owasp"
```

---

## 🎯 Test Priority Levels

### **P0 - Critical** (Must pass before deployment)
- `@smoke @critical @happy-path` - Valid login
- `@negative @critical` - Invalid login

### **P1 - High** (Should pass)
- `@validation @edge-case` - Empty credentials
- `@smoke @ui` - Page navigation

### **P2 - Security** (Must pass for security-sensitive releases)
- All `@security` tagged tests
- All `@owasp` tagged tests

---

## 💡 Best Practices

1. **Tag every test** - Makes filtering easier
2. **Use consistent naming** - Lowercase with hyphens
3. **Multiple tags OK** - Tests can have multiple tags
4. **Document tags** - Keep this guide updated
5. **Review in PRs** - Ensure new tests have appropriate tags

---

### **Non-Functional Tests**
| Tag | Purpose | Count |
|-----|---------|-------|
| `@performance` | Performance and load time tests | 2 |
| `@load-time` | Page load performance | 1 |
| `@api-response` | API response time validation | 1 |
| `@accessibility` | Accessibility compliance tests | 4 |
| `@a11y` | Short form for accessibility | 4 |
| `@keyboard` | Keyboard navigation support | 1 |
| `@aria` | ARIA labels and screen reader support | 1 |
| `@contrast` | Color contrast validation | 1 |
| `@wcag` | WCAG 2.1 compliance tests | 4 |
| `@network` | Network resilience tests | 2 |
| `@resilience` | Error handling and recovery | 2 |
| `@mobile` | Mobile device testing | 2 |
| `@3g` | Slow network simulation | 1 |
| `@error-handling` | Error handling validation | 1 |
| `@visual-regression` | Visual appearance testing | 1 |
| `@snapshot` | Screenshot comparison | 1 |
| `@responsive` | Responsive design tests | 2 |
| `@tablet` | Tablet viewport testing | 1 |
| `@viewport` | Viewport-specific tests | 2 |
| `@usability` | User experience tests | 1 |
| `@ux` | User experience validation | 1 |
| `@cache` | Browser caching tests | 1 |

---

## 🚀 How to Run Tests by Tags

### **Run Smoke Tests Only** (Fast)
```bash
npx playwright test LoginPage.spec.ts --grep "@smoke"
```

### **Run Critical Tests** (Must-pass for CI/CD)
```bash
npx playwright test LoginPage.spec.ts --grep "@critical"
```

### **Run All Security Tests**
```bash
npx playwright test LoginPage.spec.ts --grep "@security"
```

### **Run All Performance Tests**
```bash
npx playwright test LoginPage.spec.ts --grep "@performance"
```

### **Run All Accessibility Tests**
```bash
npx playwright test LoginPage.spec.ts --grep "@accessibility"
# or shorthand
npx playwright test LoginPage.spec.ts --grep "@a11y"
```

### **Run WCAG Compliance Tests**
```bash
npx playwright test LoginPage.spec.ts --grep "@wcag"
```

### **Run Network Resilience Tests**
```bash
npx playwright test LoginPage.spec.ts --grep "@network"
```

### **Run Responsive Design Tests**
```bash
npx playwright test LoginPage.spec.ts --grep "@responsive"
```

### **Run Mobile-Specific Tests**
```bash
npx playwright test LoginPage.spec.ts --grep "@mobile"
```

### **Run Visual Regression Tests**
```bash
npx playwright test LoginPage.spec.ts --grep "@visual-regression"
```

### **Run Specific Security Test**
```bash
# SQL Injection tests
npx playwright test LoginPage.spec.ts --grep "@sql-injection"

# XSS tests
npx playwright test LoginPage.spec.ts --grep "@xss"

# Rate limiting tests
npx playwright test LoginPage.spec.ts --grep "@rate-limit"
```

### **Run OWASP Security Tests**
```bash
npx playwright test LoginPage.spec.ts --grep "@owasp"
```

### **Exclude Security Tests** (Run functional only)
```bash
npx playwright test LoginPage.spec.ts --grep-invert "@security"
```

### **Combine Tags** (AND logic)
```bash
# Run smoke tests that are also critical
npx playwright test LoginPage.spec.ts --grep "@smoke.*@critical"

# Run accessibility tests that are WCAG compliant
npx playwright test LoginPage.spec.ts --grep "@accessibility.*@wcag"
```

### **Multiple Tags** (OR logic)
```bash
# Run either smoke OR critical tests
npx playwright test LoginPage.spec.ts --grep "@smoke|@critical"

# Run performance OR accessibility tests
npx playwright test LoginPage.spec.ts --grep "@performance|@accessibility"
```

---

## 📊 Recommended Test Execution Strategies

### **1. CI/CD Pipeline - Fast Feedback**
```bash
# Run only smoke and critical tests (< 2 minutes)
npx playwright test --grep "@smoke|@critical"
```

### **2. Pre-Merge Validation**
```bash
# Run functional + critical performance tests
npx playwright test --grep "@critical"
```

### **3. Nightly Security Scan**
```bash
# Run all security tests overnight
npx playwright test --grep "@security"
```

### **4. Weekly Accessibility Audit**
```bash
# Run all accessibility and WCAG tests
npx playwright test --grep "@accessibility"
```

### **5. Performance Monitoring**
```bash
# Run performance tests to track metrics
npx playwright test --grep "@performance"
```

### **6. Mobile Release Testing**
```bash
# Run all mobile and responsive tests
npx playwright test --grep "@mobile|@responsive"
```

### **7. Full Regression Suite**
```bash
# Run everything
npx playwright test LoginPage.spec.ts
```

### **8. Compliance Audit**
```bash
# Run compliance-related tests for auditors
npx playwright test --grep "@compliance|@privacy|@owasp|@wcag"
```

---

## 🎯 Test Priority Levels

### **P0 - Critical** (Must pass before deployment)
- `@smoke @critical @happy-path` - Valid login
- `@negative @critical` - Invalid login
- `@performance @load-time @critical` - Page load performance
- `@performance @api-response @critical` - Login response time

### **P1 - High** (Should pass)
- `@validation @edge-case` - Empty credentials
- `@smoke @ui` - Page navigation
- All `@accessibility` tests
- All `@responsive` tests

### **P2 - Security** (Must pass for security-sensitive releases)
- All `@security` tagged tests
- All `@owasp` tagged tests

### **P3 - Quality** (Nice to have, track over time)
- `@visual-regression` - Visual appearance
- `@network @resilience` - Network failure handling
- `@usability @ux` - User experience tests

---

## 💡 Best Practices

1. **Tag every test** - Makes filtering easier
2. **Use consistent naming** - Lowercase with hyphens
3. **Multiple tags OK** - Tests can have multiple tags
4. **Document tags** - Keep this guide updated
5. **Review in PRs** - Ensure new tests have appropriate tags
6. **Run locally before push** - Use `--grep @critical` for quick validation
7. **Track metrics** - Monitor performance test results over time
8. **Update baselines** - Keep visual regression baselines current

---

## 📈 Test Coverage Summary

**Total Tests:** 24
- **Functional Tests:** 4
- **Security Tests:** 8
- **Non-Functional Tests:** 12
  - Performance: 2
  - Accessibility: 4
  - Network Resilience: 2
  - Responsive Design: 2
  - Visual Regression: 1
  - Usability: 1

**Tag Distribution:**
- Critical tests: 4
- Smoke tests: 2
- Security tests: 8
- OWASP tests: 2
- Accessibility tests: 4
- WCAG tests: 4
- Performance tests: 2
- Network tests: 2
- Responsive tests: 2

---

## 🔍 Test Categories Breakdown

### **Quality Attributes Covered:**
✅ **Functionality** - Core login features  
✅ **Security** - OWASP Top 10, authentication  
✅ **Performance** - Load time, response time  
✅ **Accessibility** - WCAG 2.1 Level AA  
✅ **Reliability** - Network resilience, error handling  
✅ **Usability** - UX validation, form feedback  
✅ **Maintainability** - Visual regression detection  
✅ **Portability** - Mobile, tablet, desktop responsive  

### **Compliance Standards:**
- 🔐 OWASP Top 10
- ♿ WCAG 2.1 Level AA
- 🔒 HTTPS/TLS
- 🛡️ Data Privacy
