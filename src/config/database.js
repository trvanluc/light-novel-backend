require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

// Tạo pool kết nối PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Tạo adapter
const adapter = new PrismaPg(pool);

// Truyền adapter vào PrismaClient
const prisma = new PrismaClient({
  adapter,
});

module.exports = prisma;