-- Migration number: 0010 	 2024-12-30T06:24:26.246Z
ALTER TABLE verification_tokens ADD COLUMN app_id VARCHAR(255);
