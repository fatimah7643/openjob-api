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
    pgm.createTable('companies', {
        id: { type: 'VARCHAR(50)', primaryKey: true},
        name: { type: 'VARCHAR(150)', notNull: true },
        description: { type: 'TEXT' },
        address: { type: 'TEXT' },
        location: { type: 'VARCHAR(150)' },
        user_id: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: '"users"',
            onDelete: 'CASCADE',
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
    pgm.dropTable('companies');
};
