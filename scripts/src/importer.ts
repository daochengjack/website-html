#!/usr/bin/env node

import 'dotenv/config';
import { createLogger } from './utils/logger.js';
import { importFromJson } from './importers/json-importer.js';

const logger = createLogger('CLI');

async function main() {
  logger.info('🚀 Starting data importer...');

  const dataDir = process.argv[2] || './data';
  const locale = process.argv[3] || 'en';
  const throttleMs = parseInt(process.argv[4] || '100', 10);

  logger.info('Configuration:', {
    dataDir,
    locale,
    throttleMs,
  });

  try {
    const stats = await importFromJson({
      dataDir,
      locale,
      logProgress: true,
      throttleMs,
    });

    logger.success('Import completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Import failed', error);
    process.exit(1);
  }
}

main();
