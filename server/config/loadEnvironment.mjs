import dotenv from 'dotenv'

if (process.env.NOURISH_ENV_FILE) dotenv.config({ path: process.env.NOURISH_ENV_FILE, quiet: true })
