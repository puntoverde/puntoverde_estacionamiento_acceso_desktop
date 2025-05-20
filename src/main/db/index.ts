import mysql,{PoolOptions ,Pool} from 'mysql2/promise';

let _pool:Pool|undefined;

const _DBPool=():Pool=>{

    const config:PoolOptions ={
        host: import.meta.env.MAIN_VITE_HOST,        
        user: import.meta.env.MAIN_VITE_USER,
        password:import.meta.env.MAIN_VITE_PASSWORD,
        database: import.meta.env.MAIN_VITE_DATABASE,
        waitForConnections: true,
        connectionLimit: 2,
        maxIdle: 2, // max idle connections, the default value is the same as `connectionLimit`
        idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
    }

    try {
        if(!Boolean(_pool))
        {
            console.log("se genera pool de conexiones-----")
            _pool=mysql.createPool(config)
            return _pool;
        }
        else 
        {
            console.log("regresa el pool que ya estaba creado------")
            return _pool as Pool;        
        }
    } catch (error) {
        throw error
    }



}

//la ejecuto de una vez en el export para que me envie el pool y no la funcion 
export default _DBPool()