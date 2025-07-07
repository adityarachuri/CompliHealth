-- Insert sample users
INSERT INTO users (email, password_hash, role, name, organization) VALUES
('customer@example.com', '$2a$10$hash', 'customer', 'John Doe', NULL),
('hospital@example.com', '$2a$10$hash', 'hospital', 'Dr. Smith', 'City General Hospital'),
('tpa@example.com', '$2a$10$hash', 'tpa', 'Sarah Johnson', 'MediCare TPA'),
('insurer@example.com', '$2a$10$hash', 'insurer', 'Mike Wilson', 'HealthFirst Insurance');

-- Insert sample providers
INSERT INTO providers (name, type, address, phone, email) VALUES
('City General Hospital', 'Hospital', '123 Main St, City, State 12345', '555-0123', 'info@citygeneral.com'),
('Downtown Clinic', 'Clinic', '456 Oak Ave, City, State 12345', '555-0456', 'contact@downtownclinic.com'),
('Specialty Care Center', 'Specialty', '789 Pine Rd, City, State 12345', '555-0789', 'info@specialtycare.com');

-- Insert sample policies
INSERT INTO policies (policy_number, customer_id, insurer_id, policy_type, premium_amount, coverage_amount, start_date, end_date)
SELECT 
  'POL-2024-001',
  (SELECT id FROM users WHERE role = 'customer' LIMIT 1),
  (SELECT id FROM users WHERE role = 'insurer' LIMIT 1),
  'Comprehensive Health',
  500.00,
  100000.00,
  '2024-01-01',
  '2024-12-31';

-- Insert sample claims
INSERT INTO claims (claim_number, policy_id, provider_id, customer_id, tpa_id, claim_amount, diagnosis, treatment_details, status)
SELECT 
  'CLM-2024-001',
  (SELECT id FROM policies LIMIT 1),
  (SELECT id FROM providers LIMIT 1),
  (SELECT id FROM users WHERE role = 'customer' LIMIT 1),
  (SELECT id FROM users WHERE role = 'tpa' LIMIT 1),
  2500.00,
  'Acute appendicitis',
  'Emergency appendectomy procedure',
  'under_review';
