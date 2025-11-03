// lib/db/schema.ts

import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- CORE TABLES ---

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  marketingEmailConsent: boolean('marketing_email_consent').default(false),
  marketingSmsConsent: boolean('marketing_sms_consent').default(false),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  contractCredits: integer('contract_credits').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

// --- UPDATED DEFAULTS TABLE ---
export const teamContractDefaults = pgTable('team_contract_defaults', {
    id: serial('id').primaryKey(),
    teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }).unique(),
    
    // Listing Broker / Agent Details
    listingFirmName: varchar('listing_firm_name'),
    listingFirmLicenseNo: varchar('listing_firm_license_no'),
    listingAssociateName: varchar('listing_associate_name'),
    listingAssociateLicenseNo: varchar('listing_associate_license_no'),
    listingAssociateEmail: varchar('listing_associate_email'),
    listingAssociatePhone: varchar('listing_associate_phone'),
    listingSupervisorName: varchar('listing_supervisor_name'),
    listingSupervisorLicenseNo: varchar('listing_supervisor_license_no'),
    listingBrokerAddress: varchar('listing_broker_address'),

    // Other Broker Details (Typically for Buyer's Agent)
    otherFirmName: varchar('other_firm_name'),
    otherFirmLicenseNo: varchar('other_firm_license_no'),
    otherAssociateName: varchar('other_associate_name'),
    otherAssociateLicenseNo: varchar('other_associate_license_no'),

    // Other Defaults
    escrowAgentName: varchar('escrow_agent_name'),
    
    // Timestamps
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// --- APPLICATION-SPECIFIC TABLES ---

export const contracts = pgTable('contracts', {
    id: serial('id').primaryKey(),
    teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
    contractData: jsonb('contract_data').notNull(),
    status: varchar('status', { length: 50 }).default('pending_generation'),
    generatedAt: timestamp('generated_at').notNull().defaultNow(),
    filePath: text('file_path'),
});

export const creditPurchases = pgTable('credit_purchases', {
    id: serial('id').primaryKey(),
    teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    creditsPurchased: integer('credits_purchased').notNull(),
    amountPaid: integer('amount_paid'),
    stripeCheckoutSessionId: text('stripe_checkout_session_id').notNull().unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});


// --- RELATIONS ---

export const teamsRelations = relations(teams, ({ many, one }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
  contracts: many(contracts),
  creditPurchases: many(creditPurchases),
  contractDefaults: one(teamContractDefaults, {
    fields: [teams.id],
    references: [teamContractDefaults.teamId],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
  contracts: many(contracts),
}));

export const teamContractDefaultsRelations = relations(teamContractDefaults, ({ one }) => ({
  team: one(teams, {
    fields: [teamContractDefaults.teamId],
    references: [teams.id],
  }),
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
  team: one(teams, { fields: [contracts.teamId], references: [teams.id] }),
  user: one(users, { fields: [contracts.userId], references: [users.id] }),
}));

export const creditPurchasesRelations = relations(creditPurchases, ({ one }) => ({
    team: one(teams, {
      fields: [creditPurchases.teamId],
      references: [teams.id],
    }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, { fields: [invitations.teamId], references: [teams.id] }),
  invitedBy: one(users, { fields: [invitations.invitedBy], references: [users.id] }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, { fields: [teamMembers.userId], references: [users.id] }),
  team: one(teams, { fields: [teamMembers.teamId], references: [teams.id] }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, { fields: [activityLogs.teamId], references: [teams.id] }),
  user: one(users, { fields: [activityLogs.userId], references: [users.id] }),
}));


// --- TYPES ---

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamContractDefaults = typeof teamContractDefaults.$inferSelect;
export type NewTeamContractDefaults = typeof teamContractDefaults.$inferInsert;
export type Contract = typeof contracts.$inferSelect;
export type NewContract = typeof contracts.$inferInsert;
export type Trec14ContractData = any;
export type CreditPurchase = typeof creditPurchases.$inferSelect;
export type NewCreditPurchase = typeof creditPurchases.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;

export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

export enum ActivityType {
  SIGN_UP = 'SIGN_UP', SIGN_IN = 'SIGN_IN', SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD', DELETE_ACCOUNT = 'DELETE_ACCOUNT', UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM', REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER', INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION', MEMBERSHIP_PURCHASE = 'MEMBERSHIP_PURCHASE', MEMBERSHIP_RENEWAL = 'MEMBERSHIP_RENEWAL',
  CREDIT_PURCHASE = 'CREDIT_PURCHASE', CONTRACT_GENERATED = 'CONTRACT_GENERATED',
}