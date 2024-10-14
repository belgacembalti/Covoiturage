// Configurer winston
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' })
    ],
  });
  
  // Remplacer les console.log par logger.info() ou logger.error()
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      logger.info('MongoDB connected');
    })
    .catch(err => {
      logger.error('MongoDB connection error:', err);
    });
  
  io.on('connection', (socket) => {
    logger.info(`Nouvelle connexion Socket.IO: ${socket.id}`);
  
    socket.on('disconnect', () => {
      logger.info(`Socket.IO déconnecté: ${socket.id}`);
    });
  });
  