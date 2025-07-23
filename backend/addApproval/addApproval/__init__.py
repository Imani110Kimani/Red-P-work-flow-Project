import json
import logging
import re
import os
from datetime import datetime
from dotenv import load_dotenv
from azure.functions import HttpRequest, HttpResponse
from azure.data.tables import TableServiceClient, TableEntity
from azure.core.exceptions import ResourceNotFoundError, HttpResponseError

# Load environment variables from .env file
load_dotenv()

def main(req: HttpRequest) -> HttpResponse:
    logging.info('AddApproval function processed a request.')
    
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
        email = req_body.get('email')
        partition_key = req_body.get('partitionKey')
        row_key = req_body.get('rowKey')
        
        # Validate input
        if not email or not partition_key or not row_key:
            return HttpResponse(
                json.dumps({
                    "error": "Missing required fields: email, partitionKey, rowKey"
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
        
        # Do NOT create table or entity, only update existing
        entity = None
        entity_exists = False
        try:
            # Try to get existing entity
            entity = table_client.get_entity(partition_key=partition_key, row_key=row_key)
            entity_exists = True
            logging.info(f"Found existing entity: {entity}")
        except ResourceNotFoundError:
            return HttpResponse(
                json.dumps({
                    "error": "Entity not found in DynamoInfo table",
                    "partitionKey": partition_key,
                    "rowKey": row_key
                }),
                status_code=404,
                mimetype="application/json"
            )
        
        response_message = ""
        status_code = 200
        
        # Check approval status and update accordingly
        if entity.get('approval1') == email or entity.get('approval2') == email:
            return HttpResponse(
                json.dumps({
                    "error": "Cannot approve the same entity more than once with the same email address"
                }),
                status_code=400,
                mimetype="application/json"
            )
        
        # Get current timestamp in ISO format
        current_timestamp = datetime.utcnow().isoformat() + 'Z'
        
        if not entity.get('approval1'):
            # First approval
            entity['approval1'] = email
            entity['timeOfApproval1'] = current_timestamp
            response_message = 'First approval added successfully. Waiting for second approval.'
            logging.info(f"Adding first approval: {email} at {current_timestamp}")
        elif not entity.get('approval2'):
            # Second approval
            entity['approval2'] = email
            entity['timeOfApproval2'] = current_timestamp
            response_message = 'Second approval added successfully. Both approvals have been received!'
            status_code = 201  # Created - both approvals complete
            logging.info(f"Adding second approval: {email} at {current_timestamp}")
        else:
            # Both approvals already exist
            return HttpResponse(
                json.dumps({
                    "error": "Both approvals have already been received",
                    "approval1": entity.get('approval1'),
                    "approval2": entity.get('approval2'),
                    "timeOfApproval1": entity.get('timeOfApproval1'),
                    "timeOfApproval2": entity.get('timeOfApproval2')
                }),
                status_code=409,
                mimetype="application/json"
            )
        
        # Save or update entity
        table_client.update_entity(entity=entity, mode='replace')
        logging.info('Entity updated successfully')
        
        # Return success response
        response = {
            "message": response_message,
            "partitionKey": partition_key,
            "rowKey": row_key,
            "approval1": entity.get('approval1', ''),
            "approval2": entity.get('approval2', ''),
            "timeOfApproval1": entity.get('timeOfApproval1', ''),
            "timeOfApproval2": entity.get('timeOfApproval2', ''),
            "isComplete": bool(entity.get('approval1') and entity.get('approval2'))
        }
        
        return HttpResponse(
            json.dumps(response),
            status_code=status_code,
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
