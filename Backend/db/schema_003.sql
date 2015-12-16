
ALTER TABLE em_public_watchzone ADD
 COLUMN enabled_notifications BOOLEAN DEFAULT FALSE;


ALTER TABLE em_public_user ADD
  COLUMN enabled_notifications BOOLEAN DEFAULT FALSE;
