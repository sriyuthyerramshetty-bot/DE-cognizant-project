// storage/storageProvider.js
// This is the central database connection object.
// All storage managers use this connection - if you change the database,
// you only need to change this file, not the individual storage managers.

import { supabase } from '../lib/supabase'
import { TodoStorage } from './TodoStorage'
import { CartStorage } from './CartStorage'
import { CustomerStorage } from './CustomerStorage'
import { EmployeeStorage } from './EmployeeStorage'

// ============ Storage Connection ============
// This object provides a unified interface for database operations.
// Storage managers call these methods instead of directly using Supabase.

export const storageConnection = {
  // Flag to check if connection is available
  isConnected: () => {
    return Boolean(supabase)
  },

  // ============ Generic CRUD Operations ============

  async fetchAll(tableName, options = {}) {
    try {
      let query = supabase.from(tableName).select('*')

      if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending ?? false })
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) {
        console.error(`Error fetching from ${tableName}:`, error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (err) {
      console.error(`Error fetching from ${tableName}:`, err)
      return { data: null, error: err }
    }
  },

  async fetchById(tableName, idColumn, id) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq(idColumn, id)
        .single()

      if (error) {
        console.error(`Error fetching from ${tableName} by ${idColumn}:`, error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (err) {
      console.error(`Error fetching from ${tableName}:`, err)
      return { data: null, error: err }
    }
  },

  async fetchByField(tableName, fieldName, value) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq(fieldName, value)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error(`Error fetching from ${tableName} by ${fieldName}:`, error)
        return { data: null, error }
      }

      return { data: data ?? null, error: null }
    } catch (err) {
      console.error(`Error fetching from ${tableName}:`, err)
      return { data: null, error: err }
    }
  },

  async insert(tableName, record) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert(record)
        .select()
        .single()

      if (error) {
        console.error(`Error inserting into ${tableName}:`, error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (err) {
      console.error(`Error inserting into ${tableName}:`, err)
      return { data: null, error: err }
    }
  },

  async update(tableName, idColumn, id, updates) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq(idColumn, id)
        .select()
        .single()

      if (error) {
        console.error(`Error updating ${tableName}:`, error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (err) {
      console.error(`Error updating ${tableName}:`, err)
      return { data: null, error: err }
    }
  },

  async delete(tableName, idColumn, id) {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq(idColumn, id)

      if (error) {
        console.error(`Error deleting from ${tableName}:`, error)
        return { success: false, error }
      }

      return { success: true, error: null }
    } catch (err) {
      console.error(`Error deleting from ${tableName}:`, err)
      return { success: false, error: err }
    }
  },
}

// ============ Storage Instances ============
// Pass the connection to each storage manager

export const todoStorage = new TodoStorage(storageConnection)
export const cartStorage = new CartStorage(storageConnection)
export const customerStorage = new CustomerStorage(storageConnection)
export const employeeStorage = new EmployeeStorage(storageConnection)