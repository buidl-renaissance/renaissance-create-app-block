-- Add status and onboarding tracking fields to app_blocks
ALTER TABLE `app_blocks` ADD COLUMN `status` text NOT NULL DEFAULT 'draft';
ALTER TABLE `app_blocks` ADD COLUMN `block_type` text;
ALTER TABLE `app_blocks` ADD COLUMN `onboarding_stage` text DEFAULT 'questions';
ALTER TABLE `app_blocks` ADD COLUMN `onboarding_data` text;

-- Update existing blocks to be 'active' (they were created before status field)
UPDATE `app_blocks` SET `status` = 'active' WHERE `status` = 'draft';
