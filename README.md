# SonyLiv Media Manager

SonyLiv Media Manager is a simple API service built with Node.js and the Fastify framework. It provides endpoints to save, retrieve, and delete media metadata, as well as manage user roles.

## Installation

1. Clone the repository:
   git clone <repository_url>

2. Install dependencies:
   npm install

3. Start the server:
   npm run dev

   
## Usage

### API Endpoints

- `POST /save-media-metadata`: Save media metadata.
- `GET /get-user-roles`: Get available user roles.
- `POST /get-media-metadata`: Get media metadata based on user role.
- `GET /get-all-media-metadata`: Get all media metadata.
- `POST /delete-media-metadata`: Delete media metadata.

### Accessing Data

To view and interact with the data, open the `index.html` file in your browser. This HTML page makes requests to the API endpoints to fetch and display the media metadata.

### Database

As per requirement uses an in-memory database for storing media metadata.

## Authentication

Currently does not implemented any authentication or login system. Access to API endpoints is open.

## Technologies Used

- Node.js
- Fastify
- Redis


## License

This project is licensed under the [MIT License](LICENSE).
`


