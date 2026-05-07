import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Client } from 'pg';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 5432,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // 1. Create Analytics Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS faculty_metrics (
        id SERIAL PRIMARY KEY,
        faculty_id TEXT NOT NULL,
        campus TEXT NOT NULL,
        department TEXT NOT NULL,
        prajna_score FLOAT DEFAULT 0,
        h_index INTEGER DEFAULT 0,
        total_citations INTEGER DEFAULT 0,
        year INTEGER NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(faculty_id, year)
      );

      CREATE TABLE IF NOT EXISTS department_analytics (
        id SERIAL PRIMARY KEY,
        campus TEXT NOT NULL,
        department TEXT NOT NULL,
        avg_prajna_score FLOAT,
        total_publications INTEGER,
        top_researcher_id TEXT,
        month_year TEXT NOT NULL,
        UNIQUE(campus, department, month_year)
      );
    `);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "Analytics Database Initialized Successfully" })
    };
  } catch (err: any) {
    console.error("DB Init Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  } finally {
    await client.end();
  }
};
