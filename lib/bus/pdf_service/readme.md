### Build the `lib/bus/pdf_service` Python Service

1. **Build the Image**
   ```sh
   docker build -t pdf-service -f lib/bus/pdf_service/Dockerfile lib/bus/pdf_service/
   ```
2. **Run the Container**
   ```sh
   docker run -p 8082:8082 pdf-service
   ```
