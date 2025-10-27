import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1'
export { sql, eq, and, or } from 'drizzle-orm'

import * as schema from '../database/schema'

export const tables = schema

export function useDrizzle(D1: DrizzleD1Database) {
  return drizzle(D1, { schema })
}
