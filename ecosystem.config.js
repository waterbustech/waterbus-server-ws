module.exports = {
  apps: [
    {
      name: 'waterbus.sfu.ws.01',
      script: 'dist/main.js',
      instances: 1, // can set is "max" for using max of processors
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
      },
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      kill_timeout: 30000,
    },
    // {
    //   name: 'waterbus.sfu.ws.02',
    //   script: 'dist/src/main.js',
    //   instances: 1, // can set is "max" for using max of processors
    //   autorestart: true,
    //   watch: false,
    //   max_memory_restart: '2G',
    //   exec_mode: 'fork',
    //   env: {
    //     NODE_ENV: 'development',
    //     PORT: 5986,
    //     WEBSOCKET_GRPC_ADDRESS: '0.0.0.0:50057',
    //   },
    //   error_file: 'logs/error.log',
    //   out_file: 'logs/out.log',
    //   log_date_format: 'YYYY-MM-DD HH:mm:ss',
    //   kill_timeout: 30000,
    // },
  ],
};
