import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean, // Import the boolean type
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ADDED phone and marketing consent fields
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

// ADDED contract credits field
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

// NEW TABLE for owners from CSV uploads
export const owners = pgTable('owners', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').notNull().references(() => teams.id),
  fullName: varchar('full_name', { length: 255 }),
  mailingAddress: text('mailing_address'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// NEW TABLE for properties from CSV uploads
export const properties = pgTable('properties', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').notNull().references(() => teams.id),
  ownerId: integer('owner_id').references(() => owners.id),
  streetAddress: varchar('street_address', { length: 255 }),
  city: varchar('city', { length: 100 }),
  zipCode: varchar('zip_code', { length: 20 }),
  offerPrice: varchar('offer_price', { length: 50 }),
  status: varchar('status', { length: 50 }).default('pending'), // e.g., 'pending', 'generated', 'error'
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// NEW TABLE to log every generated contract for billing
export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').notNull().references(() => teams.id),
  userId: integer('user_id').notNull().references(() => users.id),
  propertyId: integer('property_id').references(() => properties.id),
  generatedAt: timestamp('generated_at').notNull().defaultNow(),
  filePath: text('file_path'), // To store the location of the generated PDF
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  teamId: integer('team_id').notNull().references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').notNull().references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').notNull().references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by').notNull().references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

// --- RELATIONS ---

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
  properties: many(properties),
  owners: many(owners),
  contracts: many(contracts),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
  contracts: many(contracts),
}));

export const ownersRelations = relations(owners, ({ one, many }) => ({
  team: one(teams, { fields: [owners.teamId], references: [teams.id] }),
  properties: many(properties),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  team: one(teams, { fields: [properties.teamId], references: [teams.id] }),
  owner: one(owners, { fields: [properties.ownerId], references: [owners.id] }),
  contracts: many(contracts),
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
  team: one(teams, { fields: [contracts.teamId], references: [teams.id] }),
  user: one(users, { fields: [contracts.userId], references: [users.id] }),
  property: one(properties, { fields: [contracts.propertyId], references: [properties.id] }),
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
export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
export type Owner = typeof owners.$inferSelect;
export type NewOwner = typeof owners.$inferInsert;
export type Contract = typeof contracts.$inferSelect;
export type NewContract = typeof contracts.$inferInsert;
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
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}