-- Users table for authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('customer', 'hospital', 'tpa', 'insurer')),
  name VARCHAR(255) NOT NULL,
  organization VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insurance policies
CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_number VARCHAR(100) UNIQUE NOT NULL,
  customer_id UUID REFERENCES users(id),
  insurer_id UUID REFERENCES users(id),
  policy_type VARCHAR(100) NOT NULL,
  premium_amount DECIMAL(10,2) NOT NULL,
  coverage_amount DECIMAL(12,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Healthcare providers/hospitals
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  network_status VARCHAR(50) DEFAULT 'in-network' CHECK (network_status IN ('in-network', 'out-of-network')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Claims
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number VARCHAR(100) UNIQUE NOT NULL,
  policy_id UUID REFERENCES policies(id),
  provider_id UUID REFERENCES providers(id),
  customer_id UUID REFERENCES users(id),
  tpa_id UUID REFERENCES users(id),
  claim_amount DECIMAL(10,2) NOT NULL,
  approved_amount DECIMAL(10,2),
  diagnosis VARCHAR(500),
  treatment_details TEXT,
  status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'paid')),
  submission_date TIMESTAMP DEFAULT NOW(),
  processed_date TIMESTAMP,
  notes TEXT
);

-- Pre-authorizations
CREATE TABLE pre_authorizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_number VARCHAR(100) UNIQUE NOT NULL,
  policy_id UUID REFERENCES policies(id),
  provider_id UUID REFERENCES providers(id),
  customer_id UUID REFERENCES users(id),
  treatment_type VARCHAR(255) NOT NULL,
  estimated_cost DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  valid_until DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
