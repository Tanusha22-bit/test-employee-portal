-- ============================================================
-- SEED DATA — Run AFTER schema.sql
-- password for all accounts: password123
-- bcrypt hash of "password123" with cost 10
-- ============================================================

-- Clear existing data (safe to re-run)
TRUNCATE sessions, offboardings, employees, aarfs, asset_assignments,
         asset_provisionings, work_details, personal_details,
         asset_inventories, onboardings, users RESTART IDENTITY CASCADE;

-- ── Users ─────────────────────────────────────────────────────────────────────
-- password hash = bcrypt("password123", 10)
INSERT INTO users (name, work_email, password_hash, role) VALUES
  ('Super Admin',       'superadmin@claritas.asia',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y', 'superadmin'),
  ('System Admin',      'sysadmin@claritas.asia',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y', 'system_admin'),
  ('Aisha Rahman',      'aisha.rahman@claritas.asia', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y', 'hr_manager'),
  ('Nurul Huda',        'nurul.huda@claritas.asia',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y', 'hr_executive'),
  ('Farah Zain',        'farah.zain@claritas.asia',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y', 'hr_intern'),
  ('Raj Kumar',         'raj.kumar@claritas.asia',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y', 'it_manager'),
  ('Wei Liang',         'wei.liang@claritas.asia',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y', 'it_executive'),
  ('Siti Noor',         'siti.noor@claritas.asia',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y', 'it_intern'),
  ('Ahmad Fadzil',      'ahmad.fadzil@claritas.asia', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y', 'employee'),
  ('Priya Menon',       'priya.menon@claritas.asia',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y', 'employee');

-- ── Staff employee records ────────────────────────────────────────────────────
INSERT INTO employees (user_id, active_from, full_name, designation, department, company, office_location, company_email, work_role, employment_type, start_date) VALUES
  (1, '2023-01-01', 'Super Admin',  'Super Admin',      'System Administration',  'Claritas Asia Sdn. Bhd.', 'Kuala Lumpur HQ', 'superadmin@claritas.asia',   'superadmin',    'permanent', '2023-01-01'),
  (2, '2023-01-01', 'System Admin', 'System Admin',     'System Administration',  'Claritas Asia Sdn. Bhd.', 'Kuala Lumpur HQ', 'sysadmin@claritas.asia',     'system_admin',  'permanent', '2023-01-01'),
  (3, '2023-01-01', 'Aisha Rahman', 'HR Manager',       'Human Resources',        'Claritas Asia Sdn. Bhd.', 'Kuala Lumpur HQ', 'aisha.rahman@claritas.asia', 'hr_manager',    'permanent', '2023-01-01'),
  (4, '2023-01-01', 'Nurul Huda',   'HR Executive',     'Human Resources',        'Claritas Asia Sdn. Bhd.', 'Kuala Lumpur HQ', 'nurul.huda@claritas.asia',   'hr_executive',  'permanent', '2023-01-01'),
  (5, '2023-01-01', 'Farah Zain',   'HR Intern',        'Human Resources',        'Claritas Asia Sdn. Bhd.', 'Kuala Lumpur HQ', 'farah.zain@claritas.asia',   'hr_intern',     'intern',    '2023-01-01'),
  (6, '2023-01-01', 'Raj Kumar',    'IT Manager',       'Information Technology', 'Claritas Asia Sdn. Bhd.', 'Kuala Lumpur HQ', 'raj.kumar@claritas.asia',    'it_manager',    'permanent', '2023-01-01'),
  (7, '2023-01-01', 'Wei Liang',    'IT Executive',     'Information Technology', 'Claritas Asia Sdn. Bhd.', 'Kuala Lumpur HQ', 'wei.liang@claritas.asia',    'it_executive',  'permanent', '2023-01-01'),
  (8, '2023-01-01', 'Siti Noor',    'IT Intern',        'Information Technology', 'Claritas Asia Sdn. Bhd.', 'Kuala Lumpur HQ', 'siti.noor@claritas.asia',    'it_intern',     'intern',    '2023-01-01');

-- ── Asset inventory ───────────────────────────────────────────────────────────
INSERT INTO asset_inventories (asset_tag, asset_name, asset_type, brand, model, serial_number, status, processor, ram_size, storage, operating_system, screen_size, purchase_vendor, purchase_cost, purchase_date, warranty_expiry_date, asset_condition, maintenance_status) VALUES
  ('LPT-001','Dell Latitude 5540','laptop','Dell','Latitude 5540','SN-DELL-001','available','Intel Core i7-1365U','16GB DDR5','512GB NVMe SSD','Windows 11 Pro','15.6 inch','Dell Malaysia',4500.00,'2024-01-15','2027-01-15','new','none'),
  ('LPT-002','HP EliteBook 840 G10','laptop','HP','EliteBook 840 G10','SN-HP-002','available','Intel Core i5-1345U','8GB DDR5','256GB NVMe SSD','Windows 11 Pro','14 inch','HP Malaysia',3800.00,'2024-02-01','2027-02-01','new','none'),
  ('LPT-003','Lenovo ThinkPad E14','laptop','Lenovo','ThinkPad E14','SN-LEN-003','available','Intel Core i5-1235U','8GB DDR4','256GB SSD','Windows 11 Home','14 inch','Lenovo Malaysia',3200.00,'2024-03-01','2027-03-01','new','none'),
  ('MON-001','Dell 24" Monitor P2422H','monitor','Dell','P2422H','SN-MON-001','available',NULL,NULL,NULL,NULL,'24 inch','Dell Malaysia',800.00,'2023-06-01','2026-06-01','good','none'),
  ('MON-002','Dell 24" Monitor P2422H','monitor','Dell','P2422H','SN-MON-002','available',NULL,NULL,NULL,NULL,'24 inch','Dell Malaysia',800.00,'2023-06-01','2026-06-01','good','none'),
  ('CNV-001','Anker USB-C Hub 7-in-1','converter','Anker','A8346','SN-CNV-001','available',NULL,NULL,NULL,NULL,NULL,'Shopee',150.00,'2024-01-01',NULL,'new','none'),
  ('PHN-001','Samsung Galaxy A54','phone','Samsung','Galaxy A54','SN-SAM-001','available',NULL,NULL,NULL,'Android 14',NULL,'Samsung Malaysia',1299.00,'2024-01-01','2026-01-01','new','none'),
  ('ACS-001','RFID Access Card','access_card','Internal','RFID v2','SN-ACS-001','available',NULL,NULL,NULL,NULL,NULL,'Internal',10.00,'2024-01-01',NULL,'new','none'),
  ('ACS-002','RFID Access Card','access_card','Internal','RFID v2','SN-ACS-002','available',NULL,NULL,NULL,NULL,NULL,'Internal',10.00,'2024-01-01',NULL,'new','none');

-- ── Onboarding 1: Ahmad Fadzil (active, start date in past) ───────────────────
INSERT INTO onboardings (status, hr_email, it_email) VALUES ('active','aisha.rahman@claritas.asia','raj.kumar@claritas.asia');

INSERT INTO personal_details (onboarding_id,full_name,official_document_id,date_of_birth,sex,marital_status,religion,race,residential_address,personal_contact_number,personal_email,bank_account_number)
VALUES (1,'Ahmad Fadzil bin Aziz','900101-14-5678','1990-01-01','male','married','Islam','Malay','No 12, Jalan Setia, Petaling Jaya, Selangor','0123456789','ahmad.fadzil@gmail.com','1234567890');

INSERT INTO work_details (onboarding_id,employee_status,staff_status,employment_type,designation,department,company,office_location,reporting_manager,start_date,company_email,role)
VALUES (1,'active','new','permanent','Software Engineer','Technology','Claritas Asia Sdn. Bhd.','Kuala Lumpur HQ','Raj Kumar','2024-03-01','ahmad.fadzil@claritas.asia','executive_associate');

INSERT INTO asset_provisionings (onboarding_id,laptop_provision,monitor_set,converter,access_card_request)
VALUES (1,true,true,true,true);

INSERT INTO asset_assignments (onboarding_id,asset_inventory_id,assigned_date,status) VALUES (1,1,'2024-03-01','assigned'),(1,4,'2024-03-01','assigned');
UPDATE asset_inventories SET status='unavailable' WHERE id IN (1,4);

INSERT INTO aarfs (onboarding_id,aarf_reference,acknowledgement_token)
VALUES (1,'AARF-AFZ001-2024','demo-token-ahmad-fadzil-aarf-2024');

UPDATE employees SET onboarding_id=1, full_name='Ahmad Fadzil bin Aziz', official_document_id='900101-14-5678',
  date_of_birth='1990-01-01', sex='male', marital_status='married', religion='Islam', race='Malay',
  residential_address='No 12, Jalan Setia, Petaling Jaya, Selangor', personal_contact_number='0123456789',
  personal_email='ahmad.fadzil@gmail.com', bank_account_number='1234567890', designation='Software Engineer',
  department='Technology', company='Claritas Asia Sdn. Bhd.', office_location='Kuala Lumpur HQ',
  reporting_manager='Raj Kumar', company_email='ahmad.fadzil@claritas.asia', start_date='2024-03-01',
  employment_type='permanent', work_role='executive_associate'
WHERE user_id=9;

-- ── Onboarding 2: Priya Menon (pending, future start date) ───────────────────
INSERT INTO onboardings (status, hr_email, it_email) VALUES ('pending','nurul.huda@claritas.asia','wei.liang@claritas.asia');

INSERT INTO personal_details (onboarding_id,full_name,official_document_id,date_of_birth,sex,marital_status,religion,race,residential_address,personal_contact_number,personal_email,bank_account_number)
VALUES (2,'Priya a/p Menon','950505-10-1234','1995-05-05','female','single','Hindu','Indian','Unit 3B, Sri Damansara, Kuala Lumpur','0198765432','priya.menon@gmail.com','9876543210');

INSERT INTO work_details (onboarding_id,employee_status,staff_status,employment_type,designation,department,company,office_location,reporting_manager,start_date,company_email,role)
VALUES (2,'active','new','permanent','Marketing Executive','Marketing','Claritas Asia Sdn. Bhd.','Kuala Lumpur HQ','Aisha Rahman','2026-06-01','priya.menon@claritas.asia','executive_associate');

INSERT INTO asset_provisionings (onboarding_id,laptop_provision,access_card_request)
VALUES (2,true,true);

INSERT INTO asset_assignments (onboarding_id,asset_inventory_id,assigned_date,status) VALUES (2,2,'2026-05-28','assigned');
UPDATE asset_inventories SET status='unavailable' WHERE id=2;

INSERT INTO aarfs (onboarding_id,aarf_reference,acknowledgement_token)
VALUES (2,'AARF-PMN002-2026','demo-token-priya-menon-aarf-2026');
