module.exports = {
  apps: [{
    name: 'notionnext',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      VERCEL_ENV: 'production',
      EXPORT: 'false'
    },
    // PM2 配置
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}