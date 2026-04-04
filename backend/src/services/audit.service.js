const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * Logs an action to the audit_logs table for compliance and traceability.
 *
 * @param {Object} params
 * @param {string} params.userId - ID of the user who performed the action
 * @param {string} params.action - Action type (e.g., 'CREATE_RECORD', 'DELETE_USER')
 * @param {string} params.targetType - Target entity type ('record', 'user')
 * @param {string} params.targetId - ID of the target entity
 * @param {Object} [params.oldData] - Previous state (for updates/deletes)
 * @param {Object} [params.newData] - New state (for creates/updates)
 * @param {string} [params.ipAddress] - Client IP address
 */
const logAction = async ({ userId, action, targetType, targetId, oldData = null, newData = null, ipAddress = null }) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (id, user_id, action, target_type, target_id, old_data, new_data, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        uuidv4(),
        userId,
        action,
        targetType,
        targetId,
        oldData ? JSON.stringify(oldData) : null,
        newData ? JSON.stringify(newData) : null,
        ipAddress,
      ]
    );
  } catch (err) {
    // Audit logging should never break the main flow
    console.error('Audit log error:', err.message);
  }
};

/**
 * Retrieves paginated audit logs with optional filters.
 */
const getAuditLogs = async (query) => {
  let filterQuery = '';
  let countQuery = 'SELECT COUNT(*) FROM audit_logs WHERE 1=1';
  let baseQuery = 'SELECT * FROM audit_logs WHERE 1=1';
  const values = [];
  const countValues = [];
  let index = 1;
  let countIndex = 1;

  if (query.targetType) {
    const filter = ` AND target_type = $${index++}`;
    baseQuery += filter;
    values.push(query.targetType);

    countQuery += ` AND target_type = $${countIndex++}`;
    countValues.push(query.targetType);
  }

  if (query.targetId) {
    const filter = ` AND target_id = $${index++}`;
    baseQuery += filter;
    values.push(query.targetId);

    countQuery += ` AND target_id = $${countIndex++}`;
    countValues.push(query.targetId);
  }

  if (query.action) {
    const filter = ` AND action = $${index++}`;
    baseQuery += filter;
    values.push(query.action);

    countQuery += ` AND action = $${countIndex++}`;
    countValues.push(query.action);
  }

  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100);
  const offset = (page - 1) * limit;

  baseQuery += ` ORDER BY created_at DESC LIMIT $${index++} OFFSET $${index++}`;
  values.push(limit, offset);

  const [dataResult, countResult] = await Promise.all([
    pool.query(baseQuery, values),
    pool.query(countQuery, countValues),
  ]);

  const total = parseInt(countResult.rows[0].count);

  return {
    data: dataResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = { logAction, getAuditLogs };
