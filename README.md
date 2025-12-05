# Matcha-Storage-API
This is a microservice which will handle Matcha Bookable's logs and demos storage.

> [!IMPORTANT]  
> This is one of the first project I've used JavaScript for, so beware of bad codes

## Endpoints
- `GET /health` - Health Check
- `GET /api/logs` - Retrieve all logs' metadatas.
- `GET /api/logs/:id/metadata` - Retrieve the log's metadata
- `POST /api/logs` - Upload a log
- `DELETE /api/logs/:id` - Delete a log