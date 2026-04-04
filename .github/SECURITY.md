# Security Policy

## Supported Versions

Security updates are provided for the latest state of the `main` branch.

## Reporting a Vulnerability

Please do not open a public issue for sensitive security reports.

Report privately via:
- GitHub Security Advisories for this repository (preferred)
- Email: Y900K@users.noreply.github.com (fallback)

Please include:
- A clear description of the issue
- Steps to reproduce
- Potential impact
- Any suggested remediation

## Response Targets

- Acknowledgement: within 72 hours
- Triage update: within 7 days
- Fix timeline: based on severity and exploitability

## Secrets and Configuration Guidance

- Never commit `.env*` files
- Keep production secrets only in deployment provider secret stores
- Rotate any key immediately if exposure is suspected
