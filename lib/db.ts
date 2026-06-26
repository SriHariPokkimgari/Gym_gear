import pg from 'pg'
const {Pool} = pg

const pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl:{
        rejectUnauthorized: false
    }
});


// const pool = new Pool({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME
// })

pool.connect().then(()=> console.log('Neon database was connected successfully.')).catch((err) => console.log(`Database connection error: ${err}`))
export default pool;

