import logging
import azure.functions as func
import os
import base64
from azure.storage.blob import BlobServiceClient
from io import BytesIO

# Environment variables (set in local.settings.json or Azure portal)
BLOB_CONNECTION_STRING = os.environ.get('BLOB_CONNECTION_STRING')
BLOB_CONTAINER_NAME = os.environ.get('BLOB_CONTAINER_NAME', 'face-references')

blob_service_client = BlobServiceClient.from_connection_string(BLOB_CONNECTION_STRING)
container_client = blob_service_client.get_container_client(BLOB_CONTAINER_NAME)


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Saving reference image to blob storage.')
    try:
        data = req.get_json()
        email = data.get('email')
        image_base64 = data.get('image_base64')
        if not email or not image_base64:
            return func.HttpResponse('Missing email or image_base64.', status_code=400)

        # Remove base64 header if present
        if image_base64.startswith('data:image'):
            image_base64 = image_base64.split(',')[1]
        image_bytes = base64.b64decode(image_base64)

        # Use email as blob name (safe for most emails)
        blob_name = f"{email.replace('@', '_at_').replace('.', '_dot_')}.jpg"
        blob_client = container_client.get_blob_client(blob_name)
        blob_client.upload_blob(image_bytes, overwrite=True)

        blob_url = blob_client.url
        return func.HttpResponse(f'{{"success": true, "blob_url": "{blob_url}"}}', mimetype='application/json', status_code=200)
    except Exception as e:
        logging.error(str(e))
        return func.HttpResponse(f'Error: {str(e)}', status_code=500)
