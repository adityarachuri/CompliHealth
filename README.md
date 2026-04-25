# CompliHealth - Healthcare Insurance Management Platform

CompliHealth is a comprehensive healthcare insurance management platform designed to streamline insurance processes for customers, hospitals, TPAs (Third Party Administrators), and insurers.

## 🏥 Features

### For Customers
- **Policy Management**: View and manage health insurance policies
- **Claims Tracking**: Submit and track insurance claims
- **Provider Directory**: Find in-network healthcare providers
- **Coverage Details**: View coverage limits and usage
- **Premium Payments**: Manage premium payments and billing

### For Hospitals
- **Patient Verification**: Verify patient insurance coverage
- **Claims Submission**: Submit claims for patient treatments
- **Provider Network**: Manage provider network status
- **Revenue Tracking**: Monitor insurance reimbursements

### For TPAs (Third Party Administrators)
- **Claims Processing**: Review and process insurance claims
- **Policy Administration**: Manage policy details and updates
- **Analytics Dashboard**: View processing metrics and KPIs
- **Audit Trail**: Complete audit logging for compliance

### For Insurers
- **Risk Management**: Assess and manage portfolio risk
- **Policy Underwriting**: Create and manage insurance policies
- **Claims Analytics**: Advanced analytics and forecasting
- **Regulatory Compliance**: HIPAA and regulatory compliance tools

## 🚀 Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Authentication**: Supabase Auth (with demo mode)
- **Database**: PostgreSQL with Supabase
- **State Management**: React Context API
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel

## 🔧 Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/your-org/complihealth.git
cd complihealth
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Demo Accounts

CompliHealth includes demo accounts for testing:

- **Customer**: `customer@demo.com` / `demo123`
- **Hospital**: `hospital@demo.com` / `demo123`
- **TPA**: `tpa@demo.com` / `demo123`
- **Insurer**: `insurer@demo.com` / `demo123`

## 📊 Database Setup

Run the SQL scripts to set up the database:

\`\`\`bash
# Create tables
npm run db:create

# Seed demo data
npm run db:seed
\`\`\`

## 🧪 Testing

Run the test suite:

\`\`\`bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
\`\`\`

## 🏗️ Project Structure

\`\`\`
complihealth/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   ├── claims/           # Claims management
│   ├── policies/         # Policy management
│   ├── providers/        # Provider directory
│   ├── coverage/         # Coverage details
│   ├── analytics/        # Analytics dashboard
│   └── login/           # Authentication
├── components/           # Reusable components
│   ├── ui/              # shadcn/ui components
│   └── layout/          # Layout components
├── contexts/            # React contexts
├── hooks/              # Custom hooks
├── lib/                # Utility functions
├── scripts/            # Database and utility scripts
└── __tests__/          # Test files
\`\`\`

## 🔒 Security & Compliance

CompliHealth is built with healthcare compliance in mind:

- **HIPAA Compliance**: Secure handling of PHI (Protected Health Information)
- **Audit Logging**: Complete audit trail for all user actions
- **Role-Based Access**: Granular permissions based on user roles
- **Data Encryption**: End-to-end encryption for sensitive data
- **Session Management**: Secure session handling and timeout

## 🚀 Deployment

Deploy to Vercel:

\`\`\`bash
npm run build
vercel deploy
\`\`\`

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Email: support@complihealth.com
- Documentation: [docs.complihealth.com](https://docs.complihealth.com)
- Issues: [GitHub Issues](https://github.com/your-org/complihealth/issues)

---

Built with ❤️ by the CompliHealth Team
