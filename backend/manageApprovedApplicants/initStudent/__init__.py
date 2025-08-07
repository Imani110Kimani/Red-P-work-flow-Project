import json
import logging
import os
from datetime import datetime
from azure.functions import HttpRequest, HttpResponse
from azure.data.tables import TableServiceClient, TableClient
from azure.core.exceptions import ResourceNotFoundError, HttpResponseError

def main(req: HttpRequest) -> HttpResponse:
    """
    Initialize a student by setting RedpStatus to 'pending'
    
    Expected JSON body:
    {
        "rowKey": "student_row_key"
    }
    """
    logging.info('InitStudent function processed a request.')
    
    try:
        # Get connection string from environment variables
        connection_string = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
        if not connection_string:
            logging.error('AZURE_STORAGE_CONNECTION_STRING environment variable is not set')
            return HttpResponse(
                json.dumps({
                    "error": "Azure Storage connection string not configured"
                }),
                status_code=500,
                mimetype="application/json"
            )
        
        # Parse request body
        try:
            req_body = req.get_json()
        except ValueError:
            return HttpResponse(
                json.dumps({
                    "error": "Invalid JSON in request body"
                }),
                status_code=400,
                mimetype="application/json"
            )
        
        if not req_body:
            return HttpResponse(
                json.dumps({
                    "error": "Request body is required"
                }),
                status_code=400,
                mimetype="application/json"
            )
        
        # Extract required fields
        row_key = req_body.get('rowKey')
        
        # Validate input
        if not row_key:
            return HttpResponse(
                json.dumps({
                    "error": "Missing required field: rowKey"
                }),
                status_code=400,
                mimetype="application/json"
            )
        
        # Initialize Table Service Client
        table_name = 'DynamoInfo'
        table_service_client = TableServiceClient.from_connection_string(connection_string)
        table_client = table_service_client.get_table_client(table_name=table_name)
        
        # Since we don't have partitionKey, we need to query for the entity
        # Using the correct partitionKey pattern for this system
        partition_key = "signup"
        
        try:
            # Try to get existing entity
            entity = table_client.get_entity(partition_key=partition_key, row_key=row_key)
            logging.info(f"Found entity with rowKey: {row_key}")
            
            # Check if status is already set to "pending" or "email sent"
            current_status = entity.get('RedpStatus', '')
            if current_status == 'pending':
                return HttpResponse(
                    json.dumps({
                        "error": f"Student with rowKey '{row_key}' is already initialized with status 'pending'",
                        "rowKey": row_key,
                        "currentStatus": current_status,
                        "message": "No action needed - student is already in pending status"
                    }),
                    status_code=400,
                    mimetype="application/json"
                )
            elif current_status == 'email sent':
                return HttpResponse(
                    json.dumps({
                        "error": f"Student with rowKey '{row_key}' already has email sent status",
                        "rowKey": row_key,
                        "currentStatus": current_status,
                        "message": "Cannot initialize - student has already completed the email process"
                    }),
                    status_code=400,
                    mimetype="application/json"
                )
                
        except ResourceNotFoundError:
            return HttpResponse(
                json.dumps({
                    "error": f"Entity with rowKey '{row_key}' not found in DynamoInfo table",
                    "rowKey": row_key
                }),
                status_code=404,
                mimetype="application/json"
            )
        
        # Update the RedpStatus field
        entity['RedpStatus'] = 'pending'
        entity['RedpInitTimestamp'] = datetime.utcnow().isoformat() + 'Z'
        
        # Update entity in table
        try:
            table_client.update_entity(entity=entity, mode='replace')
            logging.info(f'Successfully updated RedpStatus to "pending" for rowKey: {row_key}')
        except HttpResponseError as e:
            logging.error(f'Failed to update entity: {str(e)}')
            return HttpResponse(
                json.dumps({
                    "error": "Failed to update entity in database",
                    "details": str(e)
                }),
                status_code=500,
                mimetype="application/json"
            )

        # Return success response
        response = {
            "message": f"Student with rowKey '{row_key}' successfully initialized",
            "rowKey": row_key,
            "partitionKey": partition_key,
            "redpStatus": "pending",
            "timestamp": entity['RedpInitTimestamp']
        }
        
        return HttpResponse(
            json.dumps(response),
            status_code=200,
            mimetype="application/json"
        )
        
    except Exception as e:
        logging.error(f"Error processing request: {str(e)}")
        return HttpResponse(
            json.dumps({
                "error": "Internal server error",
                "details": str(e)
            }),
            status_code=500,
            mimetype="application/json"
        )
