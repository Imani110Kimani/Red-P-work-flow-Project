import json
import logging
import re
import os
import requests
from datetime import datetime
from dotenv import load_dotenv
from azure.functions import HttpRequest, HttpResponse
from azure.data.tables import TableServiceClient, TableEntity
from azure.core.exceptions import ResourceNotFoundError, HttpResponseError

# Load environment variables from .env file
load_dotenv()

def trigger_power_automate_flow(recipient, address, verdict):
    """
    Trigger Power Automate flow when a verdict is reached
    """
    try:
        power_automate_url = "https://prod-37.westus.logic.azure.com:443/workflows/c2a9b1269e53415197930e5fffcb788a/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=9KZ72xAJyzhzneU7_ntAIL8P-x-InfvHh613oiHyA2w"
        
        payload = {
            "recipient": recipient,
            "address": address,
            "verdict": verdict
        }
        
        logging.info(f"Triggering Power Automate flow for {recipient} with verdict: {verdict}")
        
        response = requests.post(
            power_automate_url,
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 200:
            logging.info(f"Successfully triggered Power Automate flow for {recipient}")
            return True
        else:
            logging.warning(f"Power Automate flow returned status {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        logging.error(f"Failed to trigger Power Automate flow: {str(e)}")
        return False
    except Exception as e:
        logging.error(f"Unexpected error triggering Power Automate flow: {str(e)}")
        return False

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
        action = req_body.get('action', 'approve')  # Default to approve for backward compatibility
        
        # Validate input
        if not email or not partition_key or not row_key:
            return HttpResponse(
                json.dumps({
                    "error": "Missing required fields: email, partitionKey, rowKey"
                }),
                status_code=400,
                mimetype="application/json"
            )
        
        # Validate action
        if action not in ['approve', 'deny']:
            return HttpResponse(
                json.dumps({
                    "error": "Invalid action. Must be 'approve' or 'deny'"
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
        
        # Get current timestamp in ISO format
        current_timestamp = datetime.utcnow().isoformat() + 'Z'
        
        if action == 'approve':
            # Handle approval workflow
            # Check if email is in denial fields and remove it if found
            denial_changed = False
            if entity.get('denial1') == email:
                entity['denial1'] = None
                entity['timeOfDenial1'] = None
                denial_changed = True
                logging.info(f"Removing {email} from denial1 to change to approval")
            elif entity.get('denial2') == email:
                entity['denial2'] = None
                entity['timeOfDenial2'] = None
                denial_changed = True
                logging.info(f"Removing {email} from denial2 to change to approval")
            
            # Check if email already used for approval
            if entity.get('approval1') == email or entity.get('approval2') == email:
                if denial_changed:
                    response_message = 'Successfully changed from denial to approval.'
                else:
                    return HttpResponse(
                        json.dumps({
                            "error": "Cannot approve the same entity more than once with the same email address"
                        }),
                        status_code=400,
                        mimetype="application/json"
                    )
            else:
                # Add approval
                if not entity.get('approval1'):
                    # First approval
                    entity['approval1'] = email
                    entity['timeOfApproval1'] = current_timestamp
                    if denial_changed:
                        response_message = 'Changed from denial to approval. This is the first approval.'
                    else:
                        response_message = 'First approval added successfully. Waiting for second approval.'
                    logging.info(f"Adding first approval: {email} at {current_timestamp}")
                elif not entity.get('approval2'):
                    # Second approval
                    entity['approval2'] = email
                    entity['timeOfApproval2'] = current_timestamp
                    if denial_changed:
                        response_message = 'Changed from denial to approval. Both approvals have been received!'
                    else:
                        response_message = 'Second approval added successfully. Both approvals have been received!'
                    status_code = 201  # Created - both approvals complete
                    logging.info(f"Adding second approval: {email} at {current_timestamp}")
                    
                    # Trigger Power Automate flow for approval verdict
                    recipient_name = f"{entity.get('firstName', 'Applicant')} {entity.get('lastName', '')}"
                    recipient_email = entity.get('email', 'Unknown')
                    trigger_power_automate_flow(recipient_name, recipient_email, "Approved")
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
        
        elif action == 'deny':
            # Handle denial workflow
            # Check if email is in approval fields and remove it if found
            approval_changed = False
            if entity.get('approval1') == email:
                entity['approval1'] = None
                entity['timeOfApproval1'] = None
                approval_changed = True
                logging.info(f"Removing {email} from approval1 to change to denial")
            elif entity.get('approval2') == email:
                entity['approval2'] = None
                entity['timeOfApproval2'] = None
                approval_changed = True
                logging.info(f"Removing {email} from approval2 to change to denial")
            
            # Check if email already used for denial
            if entity.get('denial1') == email or entity.get('denial2') == email:
                if approval_changed:
                    response_message = 'Successfully changed from approval to denial.'
                else:
                    return HttpResponse(
                        json.dumps({
                            "error": "Cannot deny the same entity more than once with the same email address"
                        }),
                        status_code=400,
                        mimetype="application/json"
                    )
            else:
                # Add denial
                if not entity.get('denial1'):
                    # First denial
                    entity['denial1'] = email
                    entity['timeOfDenial1'] = current_timestamp
                    if approval_changed:
                        response_message = 'Changed from approval to denial. This is the first denial.'
                    else:
                        response_message = 'First denial added successfully. Waiting for second denial.'
                    logging.info(f"Adding first denial: {email} at {current_timestamp}")
                elif not entity.get('denial2'):
                    # Second denial
                    entity['denial2'] = email
                    entity['timeOfDenial2'] = current_timestamp
                    if approval_changed:
                        response_message = 'Changed from approval to denial. Both denials have been received!'
                    else:
                        response_message = 'Second denial added successfully. Both denials have been received!'
                    status_code = 201  # Created - both denials complete
                    logging.info(f"Adding second denial: {email} at {current_timestamp}")
                    
                    # Trigger Power Automate flow for denial verdict
                    recipient_name = f"{entity.get('firstName', 'Applicant')} {entity.get('lastName', '')}"
                    recipient_email = entity.get('email', 'Unknown')
                    trigger_power_automate_flow(recipient_name, recipient_email, "Denied")
                else:
                    # Both denials already exist
                    return HttpResponse(
                        json.dumps({
                            "error": "Both denials have already been received",
                            "denial1": entity.get('denial1'),
                            "denial2": entity.get('denial2'),
                            "timeOfDenial1": entity.get('timeOfDenial1'),
                            "timeOfDenial2": entity.get('timeOfDenial2')
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
            "action": action,
            "partitionKey": partition_key,
            "rowKey": row_key,
            "approval1": entity.get('approval1', ''),
            "approval2": entity.get('approval2', ''),
            "timeOfApproval1": entity.get('timeOfApproval1', ''),
            "timeOfApproval2": entity.get('timeOfApproval2', ''),
            "denial1": entity.get('denial1', ''),
            "denial2": entity.get('denial2', ''),
            "timeOfDenial1": entity.get('timeOfDenial1', ''),
            "timeOfDenial2": entity.get('timeOfDenial2', ''),
            "isComplete": bool(
                (entity.get('approval1') and entity.get('approval2')) or 
                (entity.get('denial1') and entity.get('denial2'))
            ),
            "isApprovalComplete": bool(entity.get('approval1') and entity.get('approval2')),
            "isDenialComplete": bool(entity.get('denial1') and entity.get('denial2'))
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
