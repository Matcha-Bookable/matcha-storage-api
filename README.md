# Matcha-Storage-API
This is a microservice which will handle Matcha Bookable's logs and demos storage.

> [!IMPORTANT]  
> This is one of the first project I've used JavaScript for, so beware of bad codes

## Endpoints
General:
- `GET /api/health` - Health Check

Logs:
- `GET /api/logs` - Retrieve all logs' metadatas.
- `GET /api/logs/:id/metadata` - Retrieve the log's metadata
- `POST /api/logs` - Upload a log
- `DELETE /api/logs/:id` - Delete a log
- `DELETE /api/booking/:id` - Delete all logs from a bookingID

Demos:
- `GET /api/demos` - Retrieve all demos' metadatas (optionally add "parsed=true").
- `GET /api/demos/:id/metadata` - Retrieve the demo's metadata
- `POST /api/demos/presigned-url` - Get a presigned URL for uploading a demo directly to R2
- `POST /api/demos` - Save demo metadata after client uploads to R2
- `DELETE /api/demos/:id` - Delete a demo
- `DELETE /api/booking/:id` - Delete all demos from a bookingID

## Credits
- [demostf/parser](https://codeberg.org/demostf/parser) - For the demo parser