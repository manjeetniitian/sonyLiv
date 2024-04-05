const fastify = require('fastify')();
const cors = require('@fastify/cors');
const Redis = require('ioredis');
const redis = new Redis();

const { saveMediaMetadata,getUserRoles,getMediaMetadata, getAllMediaMetadata, deleteMediaMetadata } = require('./controller/mediaController');

redis.on('error', function (err) {
    console.error('Redis error:', err);
});
fastify.decorate('redis', redis);

fastify.register(cors, {
    origin: true,
});
const start = async () => {
    try {
        await fastify.listen({
            port: 3000
        });
        console.log('Server is running on port 3000');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
start();

fastify.post('/save-media-metadata', saveMediaMetadata);
fastify.get('/get-user-roles', getUserRoles);
fastify.post('/get-media-metadata', getMediaMetadata);
fastify.get('/get-all-media-metadata', getAllMediaMetadata);
fastify.post('/delete-media-metadata', deleteMediaMetadata);