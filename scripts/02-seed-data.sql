-- Insert demo user
INSERT INTO users (id, email, full_name, phone, date_of_birth, address) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'demo@healthinsurance.com', 'John Doe', '555-0123', '1985-06-15', '123 Main St, Anytown, ST 12345')
ON CONFLICT (email) DO NOTHING;

-- Insert demo policy
INSERT INTO policies (id, user_id, policy_number, policy_type, coverage_amount, deductible, premium, start_date, end_date) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'POL-2024-001', 'Health Insurance', 50000.00, 2500.00, 450.00, '2024-01-01', '2024-12-31')
ON CONFLICT (policy_number) DO NOTHING;

-- Insert demo providers
INSERT INTO providers (id, name, specialty, phone, email, address, city, state, zip_code, rating, accepts_new_patients) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'Dr. Sarah Johnson', 'Cardiology', '555-0201', 'sjohnson@heartcenter.com', '456 Medical Plaza', 'Anytown', 'ST', '12345', 4.8, true),
('550e8400-e29b-41d4-a716-446655440011', 'Dr. Michael Smith', 'Family Medicine', '555-0202', 'msmith@familycare.com', '789 Health Ave', 'Anytown', 'ST', '12345', 4.6, true),
('550e8400-e29b-41d4-a716-446655440012', 'Dr. Emily Williams', 'Dermatology', '555-0203', 'ewilliams@skinclinic.com', '321 Wellness Blvd', 'Anytown', 'ST', '12345', 4.9, true),
('550e8400-e29b-41d4-a716-446655440013', 'Dr. Robert Brown', 'Orthopedics', '555-0204', 'rbrown@bonecenter.com', '654 Sports Medicine Dr', 'Anytown', 'ST', '12345', 4.7, true),
('550e8400-e29b-41d4-a716-446655440014', 'Dr. Lisa Davis', 'Pediatrics', '555-0205', 'ldavis@kidsclinic.com', '987 Children Way', 'Anytown', 'ST', '12345', 4.8, true)
ON CONFLICT (id) DO NOTHING;

-- Insert demo claims
INSERT INTO claims (id, user_id, policy_id, provider_id, claim_number, claim_type, service_date, amount_claimed, amount_approved, amount_paid, status) VALUES
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', 'CLM-2024-001', 'Medical Consultation', '2024-01-15', 150.00, 150.00, 120.00, 'approved'),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440012', 'CLM-2024-002', 'Prescription', '2024-01-12', 85.00, 85.00, 68.00, 'processing'),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010', 'CLM-2024-003', 'Lab Tests', '2024-01-10', 220.00, null, null, 'pending')
ON CONFLICT (claim_number) DO NOTHING;

-- Insert demo appointments
INSERT INTO appointments (id, user_id, provider_id, appointment_date, appointment_time, appointment_type, status) VALUES
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010', '2024-01-25', '10:00:00', 'Follow-up', 'scheduled'),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440012', '2024-01-28', '14:30:00', 'Consultation', 'scheduled')
ON CONFLICT (id) DO NOTHING;

-- Insert demo coverage
INSERT INTO coverage (id, policy_id, coverage_type, coverage_limit, deductible, copay, coinsurance_percentage, out_of_pocket_max) VALUES
('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440001', 'Medical', 50000.00, 2500.00, 25.00, 20.00, 8000.00),
('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440001', 'Prescription', 5000.00, 250.00, 10.00, 20.00, 1000.00),
('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440001', 'Emergency', 25000.00, 500.00, 100.00, 10.00, 3000.00)
ON CONFLICT (id) DO NOTHING;

-- Insert demo analytics data
INSERT INTO analytics_metrics (user_id, metric_type, metric_value, metric_date) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'claims_count', 15, '2024-01-01'),
('550e8400-e29b-41d4-a716-446655440000', 'claims_amount', 2450.00, '2024-01-01'),
('550e8400-e29b-41d4-a716-446655440000', 'claims_count', 18, '2024-02-01'),
('550e8400-e29b-41d4-a716-446655440000', 'claims_amount', 2890.00, '2024-02-01'),
('550e8400-e29b-41d4-a716-446655440000', 'claims_count', 22, '2024-03-01'),
('550e8400-e29b-41d4-a716-446655440000', 'claims_amount', 3120.00, '2024-03-01')
ON CONFLICT DO NOTHING;
