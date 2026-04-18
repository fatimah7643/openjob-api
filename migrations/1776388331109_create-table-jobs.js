/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.createTable('jobs', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    title: { type: 'VARCHAR(255)', notNull: true },
    description: { type: 'TEXT' },
    location_type: { type: 'VARCHAR(50)' },
    location_city: { type: 'VARCHAR(100)' },
    salary_min: { type: 'INTEGER' },
    salary_max: { type: 'INTEGER' },
    is_salary_visible: { type: 'BOOLEAN', default: true },
    job_type: { type: 'VARCHAR(50)' },
    experience_level: { type: 'VARCHAR(50)' },
    status: { type: 'VARCHAR(50)', default: "'open'" },
    company_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"companies"',
      onDelete: 'CASCADE',
    },
    category_id: {
      type: 'VARCHAR(50)',
      references: '"categories"',
      onDelete: 'SET NULL',
    },
    created_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('NOW()') },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('jobs');
};
