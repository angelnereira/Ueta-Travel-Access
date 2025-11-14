-- Add password_hash column to users table
ALTER TABLE users ADD (password_hash VARCHAR2(255));

COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password';

-- Create index for faster lookups
CREATE INDEX idx_user_email_password ON users(email, password_hash);

COMMIT;
