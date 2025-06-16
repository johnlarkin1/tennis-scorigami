import { db } from "@/db";
import { SQL, and, asc, ilike, sql, ne } from "drizzle-orm";
import { PgColumn, PgTableWithColumns } from "drizzle-orm/pg-core";

interface QueryBuilderOptions<T> {
  table: PgTableWithColumns<any>;
  selectFields: Record<string, PgColumn>;
  searchColumn: PgColumn;
  orderByColumn: PgColumn;
  query?: string;
  limit: number;
  additionalConditions?: SQL[];
}

export function buildSearchQuery<T>({
  table,
  selectFields,
  searchColumn,
  orderByColumn,
  query,
  limit,
  additionalConditions = [],
}: QueryBuilderOptions<T>) {
  const baseCondition = sql`${searchColumn} IS NOT NULL`;
  
  const conditions: SQL[] = [baseCondition, ...additionalConditions];
  
  if (query) {
    conditions.push(ilike(searchColumn, `%${query}%`));
  }
  
  return db
    .select(selectFields)
    .from(table)
    .where(conditions.length > 1 ? and(...conditions) : baseCondition)
    .orderBy(asc(orderByColumn))
    .limit(limit);
}