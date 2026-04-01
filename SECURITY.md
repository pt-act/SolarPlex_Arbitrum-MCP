# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Measures

### Supply Chain Protection

1. **npm Provenance**: Enabled via `publishConfig.provenance`
   - Builds are verified to come from this repository
   - Users can verify package origin

2. **Lock File**: `package-lock.json` is committed
   - Pins exact dependency versions
   - Prevents unexpected dependency updates

3. **Audit on Publish**: `prepublishOnly` runs `npm audit`
   - Blocks publish if vulnerabilities exist
   - Ensures clean security status

4. **Minimal Files**: `.npmignore` excludes unnecessary files
   - Source code not included in package
   - Only compiled output distributed

5. **TypeScript**: Compiled code is type-checked
   - Reduces runtime errors
   - Better code quality

### Recommended User Practices

1. **Use Lock Files**: Always commit `package-lock.json`
2. **Regular Audits**: Run `npm audit` periodically
3. **Version Pinning**: Pin to specific versions in production
4. **2FA**: Enable 2FA on your npm account

## Reporting Vulnerabilities

Please report security vulnerabilities to: security@solarplex.io

Do NOT open public issues for security vulnerabilities.

## Disclosure Policy

- We will acknowledge receipt within 24 hours
- We will provide a fix within 7 days for critical issues
- We will credit reporters in security advisories
