import azure.functions as func
import json
from azure.data.tables import TableServiceClient
from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
import os
import dotenv
from datetime import datetime, timedelta

dotenv.load_dotenv(dotenv.find_dotenv())

def main(req: func.HttpRequest) -> func.HttpResponse:
    connection_string = os.environ.get('AZURE_TABLE_CONNECTION_STRING')
    table_name = os.environ.get('TABLE_NAME', 'DynamoInfo')
    blob_connection_string = os.environ.get('AZURE_BLOB_CONNECTION_STRING')
    blob_container_name = os.environ.get('BLOB_CONTAINER_NAME')
    blob_account_name = os.environ.get('BLOB_ACCOUNT_NAME', 'redpfiles')
    blob_account_key = os.environ.get('BLOB_ACCOUNT_KEY')
    service = TableServiceClient.from_connection_string(conn_str=connection_string)
    table_client = service.get_table_client(table_name=table_name)
    blob_service = None
    blob_container = None
    if blob_connection_string and blob_container_name:
        blob_service = BlobServiceClient.from_connection_string(blob_connection_string)
        blob_container = blob_service.get_container_client(blob_container_name)

    partition_key = req.params.get('partitionKey')
    row_key = req.params.get('rowKey')

    def get_blob_name(email, doc_type):
        prefix = f"{email}_{doc_type}_"
        blobs = blob_container.list_blobs(name_starts_with=prefix)
        for blob in blobs:
            return blob.name
        return None

    def get_blob_sas_url(blob_name):
        if not blob_account_key:
            return None
        sas_token = generate_blob_sas(
            account_name=blob_account_name,
            container_name=blob_container_name,
            blob_name=blob_name,
            account_key=blob_account_key,
            permission=BlobSasPermissions(read=True),
            expiry=datetime.utcnow() + timedelta(hours=1)
        )
        blob_url = f"https://{blob_account_name}.blob.core.windows.net/{blob_container_name}/{blob_name}?{sas_token}"
        return blob_url

    if partition_key and row_key:
        # Fetch specific entry
        try:
            entity = table_client.get_entity(partition_key=partition_key, row_key=row_key)
            email = entity.get('email') or entity.get('Email')
            for doc_type in ['essay', 'studentID', 'schoolDoc']:
                blob_name = get_blob_name(email, doc_type) if email else None
                if blob_name:
                    entity[doc_type + '_sas_url'] = get_blob_sas_url(blob_name)
                else:
                    entity[doc_type + '_sas_url'] = None
            return func.HttpResponse(json.dumps(entity), mimetype="application/json")
        except Exception as e:
            return func.HttpResponse(f"Error: {str(e)}", status_code=404)
    else:
        entities = table_client.list_entities()
        entities_list = list(entities)
        result = [
            {
                'firstName': e.get('firstName'),
                'lastName': e.get('lastName'),
                'status': e.get('status'),
                'partitionKey': e.get('PartitionKey'),
                'rowKey': e.get('RowKey')
            } for e in entities_list
        ]
        return func.HttpResponse(json.dumps(result), mimetype="application/json")
