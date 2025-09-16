# Security Guide

## 🚨 CRITICAL: Fix Exposed Passwords

Your GitHub repository has exposed passwords that are publicly visible. This is a serious security vulnerability that needs immediate attention.

## ⚠️ What Was Exposed

1. **Docker Compose Password**: `sari123` in `docker-compose.yml`
2. **Database Password**: Potentially in other configuration files

## 🔧 Immediate Actions Required

### 1. Change Your Database Password

```bash
# Connect to your PostgreSQL database
psql -U postgres -d "MH Factory Sari-Tracking"

# Change the password
ALTER USER postgres PASSWORD 'your_new_secure_password';
```

### 2. Update Your Local Configuration

```bash
# Update your config.env file
DB_PASSWORD=your_new_secure_password
```

### 3. Update Docker Configuration

```bash
# Create .env file for Docker
cp docker.env.example .env
# Edit .env and set: DB_PASSWORD=your_new_secure_password
```

## 🛡️ Security Best Practices

### Environment Variables
- **NEVER** commit passwords to version control
- Use environment variables for all sensitive data
- Keep `.env` and `config.env` files in `.gitignore`

### Password Requirements
- Use strong, unique passwords (12+ characters)
- Include uppercase, lowercase, numbers, and symbols
- Don't reuse passwords across systems

### File Security
```bash
# Ensure sensitive files are ignored
echo "config.env" >> .gitignore
echo ".env" >> .gitignore
echo "*.env" >> .gitignore
```

## 🔍 Check for Other Exposed Secrets

### Search Your Repository
```bash
# Search for potential passwords
grep -r "password" . --include="*.js" --include="*.json" --include="*.yml"
grep -r "PASSWORD" . --include="*.js" --include="*.json" --include="*.yml"
```

### Common Patterns to Avoid
- `password: "hardcoded"`
- `PASSWORD=hardcoded`
- `secret: "hardcoded"`
- `key: "hardcoded"`

## 🚀 Secure Deployment

### For Production
```bash
# Use environment variables
export DB_PASSWORD="your_secure_production_password"
export NODE_ENV="production"

# Or use a secrets management service
# AWS Secrets Manager, Azure Key Vault, etc.
```

### For Docker
```bash
# Use environment files
docker-compose --env-file .env up -d
```

## 📋 Security Checklist

- [ ] Changed database password
- [ ] Updated local config.env
- [ ] Created secure .env file for Docker
- [ ] Verified .gitignore includes sensitive files
- [ ] Removed hardcoded passwords from code
- [ ] Tested application with new credentials
- [ ] Updated team members about password change

## 🆘 If You Suspect Compromise

1. **Immediately change all passwords**
2. **Check database access logs**
3. **Monitor for unauthorized access**
4. **Consider rotating API keys**
5. **Review recent commits for other exposed secrets**

## 📞 Support

If you need help with security issues:
1. Review this guide thoroughly
2. Check GitHub's security documentation
3. Consider using a secrets management service
4. Implement proper CI/CD security practices

---

**Remember: Security is everyone's responsibility! 🔒**
