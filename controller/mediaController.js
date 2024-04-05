const axios = require('axios');
const Redis = require('ioredis');
const redis = new Redis();

async function saveMediaMetadata(request, reply) {
    try {
        const metadataUrl = request.body.metadata_url;
        const redis_key_name = 'movies';
        if (!metadataUrl) {
            throw new Error('metadata_url is required');
        }
        const jsonData = await fetchJsonData(metadataUrl);
        const existingMovies = JSON.parse(await redis.get(redis_key_name) || '[]');
        const updatedMovies = [];
        const newMovieTitles = new Set();
        jsonData.forEach(movie => {
            const title = movie.title;
            if (!newMovieTitles.has(title)) {
                const titleExists = existingMovies.some(existingMovie => existingMovie.title === title);
                if (!titleExists) {
                    updatedMovies.push(movie);
                    newMovieTitles.add(title);
                }
            }
        });
        if (updatedMovies.length === 0) {
            return reply.status(200).send({ status: false, message: 'All movies already exist.' });
        }
        const combinedMovies = existingMovies.concat(updatedMovies);
        await redis.set(redis_key_name, JSON.stringify(combinedMovies));
        reply.status(200).send({ status: true, message: 'Media Metadata Updated Successfully.' });
    } catch (error) {
        console.error(error);
        reply.status(500).send({ status: false, message: 'Internal Server Error' });
    }
}

async function fetchJsonData(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        throw new Error(`Error fetching JSON data from URL: ${url}`);
    }
}
async function getUserRoles(request, reply) {
    try {
        const redis_key_name = 'movies';
        const getMovies = await redis.get(redis_key_name)
        if (getMovies) {
            const accessControlKeys = new Set();
            JSON.parse(getMovies).forEach(movie => {
                const accessControl = movie.access_control;
                Object.keys(accessControl).forEach(role => {
                    accessControlKeys.add(role);
                });
            });
            let roles = Array.from(accessControlKeys);
            reply.status(200).send({ status: true, data: roles });
        } else {
            reply.status(200).send({ status: false, message: 'No Media Metadata Found.' });
        }
    } catch (error) {
        console.error(error);
        reply.status(500).send({ status: false, message: 'Internal Server Error' });
    }
}
async function getMediaMetadata(request, reply) {
    try {
        const role = request.body.role;
        const redis_key_name = 'movies';
        const getMovies = await redis.get(redis_key_name)
        if (getMovies) {
            const accessControlKeys = new Set();
            const adminMovies = filterMoviesByRoleAndKeys(JSON.parse(getMovies), role);
            console.log("Admin Movies:", adminMovies);

            reply.status(200).send({ status: true, data: adminMovies });
        } else {
            reply.status(200).send({ status: false, message: 'No Media Metadata Found.' });
        }
    } catch (error) {
        console.error(error);
        reply.status(500).send({ status: false, message: 'Internal Server Error' });
    }
}
function filterMoviesByRole(movies, role) {
    return movies.filter(movie => {
        const accessControl = movie.access_control;
        return accessControl.hasOwnProperty(role);
    });
}
function filterMoviesByRoleAndKeys(movies, role) {
    return movies.reduce((filteredMovies, movie) => {
        const accessControl = movie.access_control;
        if (accessControl.hasOwnProperty(role)) {
            const allowedKeys = accessControl[role];
            const filteredMovie = {};
            allowedKeys.forEach(key => {
                if (movie.hasOwnProperty(key)) {
                    filteredMovie[key] = movie[key];
                }
            });
            filteredMovies.push(filteredMovie);
        }
        return filteredMovies;
    }, []);
}
async function getAllMediaMetadata(request, reply) {
    try {
        const redis_key_name = 'movies';
        let getMovies = await redis.get(redis_key_name)
        getMovies = getMovies ? JSON.parse(getMovies) : []
        reply.status(200).send({ status: true, data: getMovies });
    } catch (error) {
        console.error(error);
        reply.status(500).send({ status: false, message: 'Internal Server Error' });
    }
}
async function deleteMediaMetadata(request, reply) {
    try {
        const delete_token = request.body.delete_token;
        const redis_key_name = 'movies';
        const existingMoviesJson = await redis.get(redis_key_name)
        if (existingMoviesJson) {
            let existingMovies = JSON.parse(existingMoviesJson);
            const index = existingMovies.findIndex(movie => movie.title === delete_token);
            if (index === -1) {
                reply.status(200).send({ status: false, message: 'Movie with title '+delete_token+' not found' });
            }
            existingMovies.splice(index, 1);
            await redis.set(redis_key_name, JSON.stringify(existingMovies));
            reply.status(200).send({ status: true, 'message':'Media Metadata Deleted Successfully.'  });
        } else {
            reply.status(200).send({ status: false, message: 'No Media Metadata Found.' });
        }
    } catch (error) {
        console.error(error);
        reply.status(500).send({ status: false, message: 'Internal Server Error' });
    }
}

module.exports = {
    saveMediaMetadata,
    getUserRoles,
    getMediaMetadata,
    getAllMediaMetadata,
    deleteMediaMetadata
};
