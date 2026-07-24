/**
 * Data Access Layer - A secure middle layer between the AI model and raw data.
 *
 * The AI model never gets direct access to the data files. Instead, it calls
 * specific, predefined functions on this layer. This prevents:
 * - Data exfiltration via prompt injection
 * - Uncontrolled data exposure
 * - SQL-like injection attacks on data structures
 * - Future migration to Supabase without changing AI model code
 *
 * When you migrate to Supabase, only THIS file changes — the AI model code stays the same.
 */

import { plans } from '../../server/data/data.js';
import customers from '../../server/data/customers.json';

/**
 * Search for customers by name, phone, or email.
 * Returns sanitized customer records (no sensitive backend info).
 */
export function searchCustomers(query) {
  if (!query || typeof query !== 'string') {
    return [];
  }

  const lowerQuery = query.toLowerCase().trim();
  if (lowerQuery.length < 2) {
    return [];
  }

  return customers
    .filter((customer) => {
      const name = (customer.name || '').toLowerCase();
      const phone = (customer.phone || '').toLowerCase();
      const email = (customer.email || '').toLowerCase();
      const id = (customer.id || '').toLowerCase();

      return (
        name.includes(lowerQuery) ||
        phone.includes(lowerQuery) ||
        email.includes(lowerQuery) ||
        id.includes(lowerQuery)
      );
    })
    .map((customer) => sanitizeCustomerRecord(customer))
    .slice(0, 10); // Max 10 results
}

/**
 * Get a single customer by ID.
 */
export function getCustomerById(customerId) {
  if (!customerId) {
    return null;
  }

  const customer = customers.find(
    (c) => String(c.id) === String(customerId)
  );

  return customer ? sanitizeCustomerRecord(customer) : null;
}

/**
 * Get all plans with optional filtering.
 */
export function getPlans(filters = {}) {
  let result = [...plans];

  if (filters.type) {
    result = result.filter(
      (p) => p.type && p.type.toLowerCase() === filters.type.toLowerCase()
    );
  }

  if (filters.minSpeed !== undefined) {
    result = result.filter((p) => p.speed >= filters.minSpeed);
  }

  if (filters.maxPrice !== undefined) {
    result = result.filter((p) => p.price <= filters.maxPrice);
  }

  return result.slice(0, 50);
}

/**
 * Search for plans by name or description.
 */
export function searchPlans(query) {
  if (!query || typeof query !== 'string') {
    return [];
  }

  const lowerQuery = query.toLowerCase().trim();
  if (lowerQuery.length < 2) {
    return [];
  }

  return plans
    .filter((plan) => {
      const name = (plan.name || '').toLowerCase();
      const description = (plan.description || '').toLowerCase();
      const type = (plan.type || '').toLowerCase();

      return (
        name.includes(lowerQuery) ||
        description.includes(lowerQuery) ||
        type.includes(lowerQuery)
      );
    })
    .slice(0, 10);
}

/**
 * Get plan recommendations based on criteria.
 */
export function getRecommendedPlans(criteria = {}) {
  let result = getPlans(criteria);

  if (criteria.sortBy === 'value') {
    result.sort((a, b) => {
      const aValue = a.price / (a.speed || 1);
      const bValue = b.price / (b.speed || 1);
      return aValue - bValue;
    });
  } else if (criteria.sortBy === 'speed') {
    result.sort((a, b) => b.speed - a.speed);
  } else if (criteria.sortBy === 'price') {
    result.sort((a, b) => a.price - b.price);
  }

  return result.slice(0, 5);
}

/**
 * Get summary statistics about available plans and customers.
 */
export function getDataSummary() {
  return {
    totalPlans: plans.length,
    totalCustomers: customers.length,
    planTypes: [...new Set(plans.map((p) => p.type))],
    priceRange: {
      min: Math.min(...plans.map((p) => p.price || 0)),
      max: Math.max(...plans.map((p) => p.price || 0)),
    },
    speedRange: {
      min: Math.min(...plans.map((p) => p.speed || 0)),
      max: Math.max(...plans.map((p) => p.speed || 0)),
    },
  };
}

/**
 * Sanitize a customer record before exposing to the AI.
 */
function sanitizeCustomerRecord(customer) {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
  };
}

/**
 * Validate a data access request.
 */
export function validateDataAccess(operation, params = {}) {
  if (!operation || typeof operation !== 'string') {
    return { allowed: false, reason: 'Invalid operation' };
  }

  const allowedOps = [
    'search_customers',
    'get_customer',
    'get_plans',
    'search_plans',
    'get_recommendations',
    'get_summary',
  ];

  if (!allowedOps.includes(operation)) {
    return { allowed: false, reason: `Operation "${operation}" not allowed` };
  }

  if (params.query && params.query.length > 500) {
    return { allowed: false, reason: 'Query too long' };
  }

  return { allowed: true };
}