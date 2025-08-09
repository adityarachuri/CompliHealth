-- CompliHealth Sample Data
-- Seed data for healthcare insurance management platform

-- Insert demo users for CompliHealth
INSERT INTO users (id, email, name, role, organization, phone, address) VALUES
-- Customers
('550e8400-e29b-41d4-a716-446655440001', 'customer@demo.com', 'John Smith', 'customer', NULL, '+1-555-0101', '123 Main St, Anytown, ST 12345'),
('550e8400-e29b-41d4-a716-446655440002', 'jane.doe@email.com', 'Jane Doe', 'customer', NULL, '+1-555-0102', '456 Oak Ave, Somewhere, ST 67890'),
('550e8400-e29b-41d4-a716-446655440003', 'mike.wilson@email.com', 'Mike Wilson', 'customer', NULL, '+1-555-0103', '789 Pine Rd, Elsewhere, ST 11111'),

-- Hospitals
('550e8400-e29b-41d4-a716-446655440011', 'hospital@demo.com', 'Dr. Sarah Johnson', 'hospital', 'City General Hospital', '+1-555-0201', '100 Hospital Way, Medical City, ST 22222'),
('550e8400-e29b-41d4-a716-446655440012', 'mercy.hospital@email.com', 'Dr. Robert Chen', 'hospital', 'Mercy Medical Center', '+1-555-0202', '200 Mercy Blvd, Healthcare Town, ST 33333'),

-- TPAs
('550e8400-e29b-41d4-a716-446655440021', 'tpa@demo.com', 'Michael Chen', 'tpa', 'HealthAdmin TPA Services', '+1-555-0301', '300 Admin Plaza, Business District, ST 44444'),
('550e8400-e29b-41d4-a716-446655440022', 'claims.pro@email.com', 'Lisa Rodriguez', 'tpa', 'ClaimsPro TPA', '+1-555-0302', '400 Claims Center, Processing Park, ST 55555'),

-- Insurers
('550e8400-e29b-41d4-a716-446655440031', 'insurer@demo.com', 'Lisa Rodriguez', 'insurer', 'CompliHealth Insurance Co.', '+1-555-0401', '500 Insurance Tower, Financial District, ST 66666'),
('550e8400-e29b-41d4-a716-446655440032', 'secure.health@email.com', 'David Park', 'insurer', 'SecureHealth Insurance', '+1-555-0402', '600 Security Blvd, Trust Valley, ST 77777')

ON CONFLICT (id) DO NOTHING;

-- Insert sample insurance policies
INSERT INTO policies (id, policy_number, customer_id, insurer_id, policy_type, coverage_amount, premium_amount, deductible, start_date, end_date, status) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'POL-2024-001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440031', 'Individual Health', 500000.00, 450.00, 2500.00, '2024-01-01', '2024-12-31', 'active'),
('660e8400-e29b-41d4-a716-446655440002', 'POL-2024-002', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440031', 'Family Health', 1000000.00, 850.00, 5000.00, '2024-01-01', '2024-12-31', 'active'),
('660e8400-e29b-41d4-a716-446655440003', 'POL-2024-003', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440032', 'Individual Health', 750000.00, 620.00, 3000.00, '2024-01-01', '2024-12-31', 'active')

ON CONFLICT (id) DO NOTHING;

-- Insert healthcare providers
INSERT INTO providers (id, user_id, provider_name, specialty, license_number, network_status, address, phone, email, rating) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', 'City General Hospital', 'General Medicine', 'LIC-HOSP-001', 'in_network', '100 Hospital Way, Medical City, ST 22222', '+1-555-0201', 'hospital@demo.com', 4.8),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440012', 'Mercy Medical Center', 'Cardiology', 'LIC-HOSP-002', 'in_network', '200 Mercy Blvd, Healthcare Town, ST 33333', '+1-555-0202', 'mercy.hospital@email.com', 4.9),
('770e8400-e29b-41d4-a716-446655440003', NULL, 'Downtown Clinic', 'Family Medicine', 'LIC-CLIN-001', 'in_network', '150 Downtown St, City Center, ST 88888', '+1-555-0203', 'downtown.clinic@email.com', 4.6),
('770e8400-e29b-41d4-a716-446655440004', NULL, 'Specialist Care Center', 'Orthopedics', 'LIC-SPEC-001', 'in_network', '250 Specialist Ave, Medical Plaza, ST 99999', '+1-555-0204', 'specialist.care@email.com', 4.7)

ON CONFLICT (id) DO NOTHING;

-- Insert sample claims
INSERT INTO claims (id, claim_number, policy_id, customer_id, provider_id, claim_type, diagnosis_code, treatment_description, claim_amount, approved_amount, status, submission_date, processing_date, notes) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'CLM-2024-001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', 'Medical Consultation', 'Z00.00', 'Annual physical examination', 250.00, 200.00, 'approved', '2024-01-15', '2024-01-18', 'Routine checkup approved'),
('880e8400-e29b-41d4-a716-446655440002', 'CLM-2024-002', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', 'Prescription', 'M79.3', 'Prescription medication for back pain', 85.00, 68.00, 'paid', '2024-01-20', '2024-01-22', 'Prescription coverage applied'),
('880e8400-e29b-41d4-a716-446655440003', 'CLM-2024-003', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440012', 'Diagnostic Test', 'Z12.31', 'Mammography screening', 180.00, NULL, 'under_review', '2024-01-25', NULL, 'Awaiting medical review'),
('880e8400-e29b-41d4-a716-446655440004', 'CLM-2024-004', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440011', 'Emergency Care', 'S72.001A', 'Emergency room visit for fracture', 1250.00, NULL, 'submitted', '2024-01-28', NULL, 'Emergency claim submitted')

ON CONFLICT (id) DO NOTHING;

-- Insert coverage details
INSERT INTO coverage_details (id, policy_id, coverage_type, coverage_limit, copay_amount, coinsurance_percentage, deductible_amount) VALUES
('990e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Primary Care', 50000.00, 25.00, 20.00, 500.00),
('990e8400-e29b-41d4-a716-446655440002', '660e  'Primary Care', 50000.00, 25.00, 20.00, 500.00),
('990e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Specialist Care', 100000.00, 50.00, 30.00, 1000.00),
('990e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'Emergency Care', 250000.00, 100.00, 20.00, 2500.00),
('990e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', 'Primary Care', 75000.00, 30.00, 20.00, 750.00),
('990e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002', 'Specialist Care', 150000.00, 60.00, 25.00, 1500.00),
('990e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440003', 'Primary Care', 60000.00, 35.00, 25.00, 600.00)

ON CONFLICT (id) DO NOTHING;

-- Insert sample appointments
INSERT INTO appointments (id, customer_id, provider_id, appointment_date, appointment_type, status, notes) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '2024-02-15 14:00:00+00', 'Annual Physical', 'scheduled', 'Routine annual checkup'),
('aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', '2024-02-22 10:30:00+00', 'Cardiology Follow-up', 'scheduled', 'Follow-up for heart health'),
('aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440003', '2024-02-18 09:00:00+00', 'Family Medicine', 'scheduled', 'Family health consultation'),
('aa0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440004', '2024-02-20 15:30:00+00', 'Orthopedic Consultation', 'scheduled', 'Joint pain evaluation')

ON CONFLICT (id) DO NOTHING;

-- Insert sample audit log entries for CompliHealth compliance
INSERT INTO audit_log (id, user_id, action, table_name, record_id, new_values, ip_address, created_at) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'LOGIN', 'users', '550e8400-e29b-41d4-a716-446655440001', '{"login_time": "2024-01-15T08:30:00Z"}', '192.168.1.100', '2024-01-15 08:30:00+00'),
('bb0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'CREATE_CLAIM', 'claims', '880e8400-e29b-41d4-a716-446655440001', '{"claim_number": "CLM-2024-001", "amount": 250.00}', '192.168.1.100', '2024-01-15 09:15:00+00'),
('bb0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440021', 'APPROVE_CLAIM', 'claims', '880e8400-e29b-41d4-a716-446655440001', '{"status": "approved", "approved_amount": 200.00}', '192.168.1.200', '2024-01-18 14:20:00+00')

ON CONFLICT (id) DO NOTHING;

-- Create views for CompliHealth reporting
CREATE OR REPLACE VIEW customer_policy_summary AS
SELECT 
    u.name as customer_name,
    u.email as customer_email,
    p.policy_number,
    p.policy_type,
    p.coverage_amount,
    p.premium_amount,
    p.status as policy_status,
    COUNT(c.id) as total_claims,
    COALESCE(SUM(c.approved_amount), 0) as total_approved_amount
FROM users u
JOIN policies p ON u.id = p.customer_id
LEFT JOIN claims c ON p.id = c.policy_id
WHERE u.role = 'customer'
GROUP BY u.id, u.name, u.email, p.id, p.policy_number, p.policy_type, p.coverage_amount, p.premium_amount, p.status;

CREATE OR REPLACE VIEW claims_processing_summary AS
SELECT 
    c.status,
    COUNT(*) as claim_count,
    AVG(c.claim_amount) as avg_claim_amount,
    SUM(c.claim_amount) as total_claim_amount,
    AVG(CASE WHEN c.processing_date IS NOT NULL 
        THEN EXTRACT(days FROM c.processing_date - c.submission_date) 
        ELSE NULL END) as avg_processing_days
FROM claims c
GROUP BY c.status;

-- Add CompliHealth system configuration
INSERT INTO audit_log (id, user_id, action, table_name, new_values, created_at) VALUES
('bb0e8400-e29b-41d4-a716-446655440999', NULL, 'SYSTEM_INIT', 'system', '{"platform": "CompliHealth", "version": "1.0.0", "initialized": true}', NOW())
ON CONFLICT (id) DO NOTHING;

-- Grant appropriate permissions (adjust based on your security requirements)
-- Note: In production, create specific roles with limited permissions
COMMENT ON DATABASE postgres IS 'CompliHealth - Healthcare Insurance Management Platform Database';
