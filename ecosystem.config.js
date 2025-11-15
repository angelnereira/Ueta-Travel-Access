/**
 * PM2 Ecosystem Configuration
 * Configuración para el proceso manager PM2 en Oracle Cloud
 *
 * Documentación: https://pm2.keymetrics.io/docs/usage/application-declaration/
 */

module.exports = {
  apps: [
    {
      name: 'ueta-travel-access',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/home/opc/ueta-travel-access',
      instances: 2,
      exec_mode: 'cluster',

      // Auto-reiniciar si el uso de memoria excede 1GB
      max_memory_restart: '1G',

      // Variables de entorno
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },

      // Configuración de logs
      error_file: '/home/opc/logs/ueta-error.log',
      out_file: '/home/opc/logs/ueta-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Auto-restart configuración
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 10000,
      kill_timeout: 5000,

      // Esperar 1 segundo antes de reiniciar después de un crash
      restart_delay: 1000,

      // Incrementar tiempo de espera para graceful shutdown
      wait_ready: true,

      // Configuración de monitoreo
      instance_var: 'INSTANCE_ID',
      combine_logs: true,

      // Señales de proceso
      shutdown_with_message: false,
      kill_retry_time: 100
    }
  ],

  // Configuración de despliegue (opcional, para PM2 deploy)
  deploy: {
    production: {
      user: 'opc',
      host: 'ORACLE_CLOUD_IP', // Reemplazar con IP real
      ref: 'origin/main',
      repo: 'https://github.com/USUARIO/ueta-travel-access.git',
      path: '/home/opc/ueta-travel-access',
      'post-deploy': 'npm ci --production && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'mkdir -p /home/opc/logs',
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};
