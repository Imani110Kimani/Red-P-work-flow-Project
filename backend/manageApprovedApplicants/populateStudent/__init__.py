import json
import logging
import os
import re
from datetime import datetime
from azure.functions import HttpRequest, HttpResponse
from azure.data.tables import TableServiceClient, TableClient
from azure.core.exceptions import ResourceNotFoundError, HttpResponseError

def main(req: HttpRequest) -> HttpResponse:
    """
    Populate student email and set RedpStatus to 'email sent'
    
    Expected JSON body:
    {
        "rowKey": "student_row_key",
        "email": "student@email.com"
    }
    """
    logging.info('PopulateStudent function processed a request.')
    
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
        email = req_body.get('email')
        
        # Validate input
        if not row_key or not email:
            return HttpResponse(
                json.dumps({
                    "error": "Missing required fields: rowKey, email"
                }),
                status_code=400,
                mimetype="application/json"
            )
        
        # Validate email format
        email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_regex, email):
            return HttpResponse(
                json.dumps({
                    "error": "Invalid email format"
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
            
            # Check status - only proceed if status is "pending"
            current_status = entity.get('RedpStatus', '')
            current_email = entity.get('RedpEmail', '')
            
            if current_status == 'email sent':
                return HttpResponse(
                    json.dumps({
                        "error": f"Student with rowKey '{row_key}' already has email sent status",
                        "rowKey": row_key,
                        "currentStatus": current_status,
                        "currentEmail": current_email,
                        "message": "No action needed - email is already sent and populated"
                    }),
                    status_code=400,
                    mimetype="application/json"
                )
            elif current_status != 'pending':
                return HttpResponse(
                    json.dumps({
                        "error": f"Student with rowKey '{row_key}' must have 'pending' status to populate email",
                        "rowKey": row_key,
                        "currentStatus": current_status if current_status else "empty",
                        "message": "Student must be initialized (pending status) before email can be populated"
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
        
        # Update the RedpEmail and RedpStatus fields
        entity['RedpEmail'] = email
        entity['RedpStatus'] = 'email sent'
        entity['RedpEmailTimestamp'] = datetime.utcnow().isoformat() + 'Z'
        
        # Update entity in table
        try:
            table_client.update_entity(entity=entity, mode='replace')
            logging.info(f'Successfully updated RedpEmail to "{email}" and RedpStatus to "email sent" for rowKey: {row_key}')
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
            "message": f"Student with rowKey '{row_key}' successfully populated with email",
            "rowKey": row_key,
            "partitionKey": partition_key,
            "redpEmail": email,
            "redpStatus": "email sent",
            "timestamp": entity['RedpEmailTimestamp']
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
