// Database schema definitions
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, pgEnum, index, unique } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

// Define role enum for org members
export const orgRoleEnum = pgEnum("org_role", ["owner", "admin", "developer"]);

// Org table
export const org = pgTable("org", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Org member junction table
export const orgMember = pgTable(
  "org_member",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => org.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: orgRoleEnum("role").notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => [
    unique("org_user_unique").on(table.orgId, table.userId),
    index("org_member_user_idx").on(table.userId),
    index("org_member_org_idx").on(table.orgId),
  ],
);

// Relations
export const orgRelations = relations(org, ({ many }) => ({
  members: many(orgMember),
}));

export const orgMemberRelations = relations(orgMember, ({ one }) => ({
  org: one(org, {
    fields: [orgMember.orgId],
    references: [org.id],
  }),
  user: one(user, {
    fields: [orgMember.userId],
    references: [user.id],
  }),
}));
