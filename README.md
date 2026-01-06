# Matcha-Storage-API
This is a microservice which will handle Matcha Bookable's logs and demos storage.

> [!IMPORTANT]
> This is one of the first project I've used JavaScript for, so beware of bad codes

## Endpoints

### Health
- `GET /api/health` - Health check

### Logs
- `GET /api/logs` - Retrieve all logs' metadata
- `GET /api/logs/:id` - Retrieve a log's metadata
- `POST /api/logs` - Upload a log
- `DELETE /api/logs/:id` - Delete a log

### Demos
- `GET /api/demos` - Retrieve all demos' metadata
- `GET /api/demos/:id` - Retrieve a demo's metadata
- `GET /api/demos/:id/download` - Get demo download URL
- `POST /api/demos/presigned-url` - Get a presigned URL for uploading a demo directly to R2
- `POST /api/demos` - Save demo metadata after client uploads to R2
- `DELETE /api/demos/:id` - Delete a demo

### Bookings
- `GET /api/bookings` - Retrieve all bookings with their logs and demos
- `GET /api/bookings/:id` - Retrieve a booking's logs and demos
- `DELETE /api/bookings/:id/logs` - Delete all logs for a booking
- `DELETE /api/bookings/:id/demos` - Delete all demos for a booking

## API Documentation
See [openapi.yaml](openapi.yaml) for full API specification.

## Credits
- [demostf/parser](https://codeberg.org/demostf/parser) - For the demo parser