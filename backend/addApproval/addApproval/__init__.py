import json
import logging
import re
import os
import requests
import math
from datetime import datetime
from dotenv import load_dotenv
from azure.functions import HttpRequest, HttpResponse
from azure.data.tables import TableServiceClient, TableEntity
from azure.core.exceptions import ResourceNotFoundError, HttpResponseError

# Load environment variables from .env file
load_dotenv()

def get_admin_count():
    """
    Fetch the current number of admins from the admin management API
    """
    try:
        admin_api_url = "https://simbamanageadmins-egambyhtfxbfhabc.westus-01.azurewebsites.net/api/read-admin"
        
        response = requests.get(
            admin_api_url,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('admins'):
                admin_count = len(data['admins'])
                logging.info(f"Current admin count: {admin_count}")
                return admin_count
            else:
                logging.warning("Admin API returned success=false or no admins found")
                return 3  # Default fallback
        else:
            logging.warning(f"Admin API returned status {response.status_code}")
            return 3  # Default fallback
            
    except requests.exceptions.RequestException as e:
        logging.error(f"Failed to fetch admin count: {str(e)}")
        return 3  # Default fallback
    except Exception as e:
        logging.error(f"Unexpected error fetching admin count: {str(e)}")
        return 3  # Default fallback

def calculate_thresholds(admin_count):
    """
    Calculate approval and denial thresholds based on admin count
    - Approval: more than 2/3 of admins (rounded up)
    - Denial: more than 1/3 of admins (rounded up)
    """
    approval_threshold = math.ceil(admin_count * 2/3)
    denial_threshold = math.ceil(admin_count * 1/3)
    
    # Ensure minimum thresholds
    approval_threshold = max(approval_threshold, 1)
    denial_threshold = max(denial_threshold, 1)
    
    logging.info(f"Admin count: {admin_count}, Approval threshold: {approval_threshold}, Denial threshold: {denial_threshold}")
    return approval_threshold, denial_threshold

def get_approval_emails(entity):
    """Get list of approval emails from entity"""
    approvals = []
    i = 1
    while entity.get(f'approval{i}'):
        approvals.append(entity.get(f'approval{i}'))
        i += 1
    return approvals

def get_denial_emails(entity):
    """Get list of denial emails from entity"""
    denials = []
    i = 1
    while entity.get(f'denial{i}'):
        denials.append(entity.get(f'denial{i}'))
        i += 1
    return denials

def remove_email_from_approvals(entity, email):
    """Remove email from approval fields and compact the list"""
    approvals = get_approval_emails(entity)
    if email in approvals:
        # Save original timestamps before clearing
        original_timestamps = {}
        i = 1
        while entity.get(f'approval{i}') is not None:
            if entity.get(f'approval{i}') != email:  # Don't save the timestamp for the email being removed
                original_timestamps[entity.get(f'approval{i}')] = entity.get(f'timeOfApproval{i}')
            entity[f'approval{i}'] = None
            entity[f'timeOfApproval{i}'] = None
            i += 1
        
        # Re-add remaining approvals with their original timestamps
        approvals.remove(email)
        for idx, approval_email in enumerate(approvals, 1):
            entity[f'approval{idx}'] = approval_email
            entity[f'timeOfApproval{idx}'] = original_timestamps.get(approval_email, '')
        return True
    return False

def remove_email_from_denials(entity, email):
    """Remove email from denial fields and compact the list"""
    denials = get_denial_emails(entity)
    if email in denials:
        # Save original timestamps before clearing
        original_timestamps = {}
        i = 1
        while entity.get(f'denial{i}') is not None:
            if entity.get(f'denial{i}') != email:  # Don't save the timestamp for the email being removed
                original_timestamps[entity.get(f'denial{i}')] = entity.get(f'timeOfDenial{i}')
            entity[f'denial{i}'] = None
            entity[f'timeOfDenial{i}'] = None
            i += 1
        
        # Re-add remaining denials with their original timestamps
        denials.remove(email)
        for idx, denial_email in enumerate(denials, 1):
            entity[f'denial{idx}'] = denial_email
            entity[f'timeOfDenial{idx}'] = original_timestamps.get(denial_email, '')
        return True
    return False
    return False

def add_approval(entity, email, timestamp):
    """Add approval to the next available slot"""
    i = 1
    while entity.get(f'approval{i}'):
        i += 1
    entity[f'approval{i}'] = email
    entity[f'timeOfApproval{i}'] = timestamp
    return i

def add_denial(entity, email, timestamp):
    """Add denial to the next available slot"""
    i = 1
    while entity.get(f'denial{i}'):
        i += 1
    entity[f'denial{i}'] = email
    entity[f'timeOfDenial{i}'] = timestamp
    return i

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

def initialize_approved_student(row_key):
    """
    Initialize an approved student by calling the initStudent endpoint
    """
    try:
        init_student_url = "https://simbamanageapprovedapplicants-c3a7cghkgjg5grfy.westus-01.azurewebsites.net/api/initStudent"
        
        payload = {
            "rowKey": row_key
        }
        
        logging.info(f"Initializing approved student with rowKey: {row_key}")
        
        response = requests.post(
            init_student_url,
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            logging.info(f"Successfully initialized student {row_key} with status: {result.get('redpStatus', 'unknown')}")
            return True, result.get('message', 'Student initialized successfully')
        else:
            result = response.json()
            error_msg = result.get('error', 'Unknown error')
            if 'already initialized' in error_msg or 'already has email sent status' in error_msg:
                logging.info(f"Student {row_key} already initialized: {error_msg}")
                return True, error_msg  # This is okay - student was already processed
            else:
                logging.warning(f"Failed to initialize student {row_key}: {error_msg}")
                return False, error_msg
            
    except requests.exceptions.RequestException as e:
        logging.error(f"Network error initializing student {row_key}: {str(e)}")
        return False, f"Network error: {str(e)}"
    except Exception as e:
        logging.error(f"Unexpected error initializing student {row_key}: {str(e)}")
        return False, f"Unexpected error: {str(e)}"

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
        
        # Get current admin count and calculate thresholds
        admin_count = get_admin_count()
        approval_threshold, denial_threshold = calculate_thresholds(admin_count)
        
        # Get current timestamp in ISO format
        current_timestamp = datetime.utcnow().isoformat() + 'Z'
        
        if action == 'approve':
            # Handle approval workflow
            # Check if email is in denial fields and remove it if found
            denial_changed = remove_email_from_denials(entity, email)
            if denial_changed:
                logging.info(f"Removing {email} from denials to change to approval")
            
            # Check if email already used for approval
            approval_emails = get_approval_emails(entity)
            if email in approval_emails:
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
                approval_number = add_approval(entity, email, current_timestamp)
                current_approval_count = len(get_approval_emails(entity))
                
                if current_approval_count >= approval_threshold:
                    # Approval threshold reached
                    if denial_changed:
                        response_message = f'Changed from denial to approval. Approval threshold reached ({current_approval_count}/{approval_threshold})!'
                    else:
                        response_message = f'Approval #{current_approval_count} added successfully. Approval threshold reached ({current_approval_count}/{approval_threshold})!'
                    status_code = 201  # Created - approval complete
                    logging.info(f"Approval threshold reached: {current_approval_count}/{approval_threshold}")
                    
                    # Initialize the approved student
                    init_success, init_message = initialize_approved_student(row_key)
                    if init_success:
                        logging.info(f"Student initialization successful: {init_message}")
                        response_message += f" Student automatically initialized for next steps."
                    else:
                        logging.warning(f"Student initialization failed: {init_message}")
                        response_message += f" Note: Student initialization failed - {init_message}"
                    
                    # Trigger Power Automate flow for approval verdict
                    recipient_name = f"{entity.get('firstName', 'Applicant')} {entity.get('lastName', '')}"
                    recipient_email = entity.get('email', 'Unknown')
                    trigger_power_automate_flow(recipient_name, recipient_email, "Approved")
                else:
                    # Still need more approvals
                    if denial_changed:
                        response_message = f'Changed from denial to approval. Need {approval_threshold - current_approval_count} more approval(s).'
                    else:
                        response_message = f'Approval #{current_approval_count} added successfully. Need {approval_threshold - current_approval_count} more approval(s).'
                    logging.info(f"Approval {current_approval_count}/{approval_threshold} - need {approval_threshold - current_approval_count} more")
        
        elif action == 'deny':
            # Handle denial workflow
            # Check if email is in approval fields and remove it if found
            approval_changed = remove_email_from_approvals(entity, email)
            if approval_changed:
                logging.info(f"Removing {email} from approvals to change to denial")
            
            # Check if email already used for denial
            denial_emails = get_denial_emails(entity)
            if email in denial_emails:
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
                denial_number = add_denial(entity, email, current_timestamp)
                current_denial_count = len(get_denial_emails(entity))
                
                if current_denial_count >= denial_threshold:
                    # Denial threshold reached
                    if approval_changed:
                        response_message = f'Changed from approval to denial. Denial threshold reached ({current_denial_count}/{denial_threshold})!'
                    else:
                        response_message = f'Denial #{current_denial_count} added successfully. Denial threshold reached ({current_denial_count}/{denial_threshold})!'
                    status_code = 201  # Created - denial complete
                    logging.info(f"Denial threshold reached: {current_denial_count}/{denial_threshold}")
                    
                    # Trigger Power Automate flow for denial verdict
                    recipient_name = f"{entity.get('firstName', 'Applicant')} {entity.get('lastName', '')}"
                    recipient_email = entity.get('email', 'Unknown')
                    trigger_power_automate_flow(recipient_name, recipient_email, "Denied")
                else:
                    # Still need more denials
                    if approval_changed:
                        response_message = f'Changed from approval to denial. Need {denial_threshold - current_denial_count} more denial(s).'
                    else:
                        response_message = f'Denial #{current_denial_count} added successfully. Need {denial_threshold - current_denial_count} more denial(s).'
                    logging.info(f"Denial {current_denial_count}/{denial_threshold} - need {denial_threshold - current_denial_count} more")
        
        # Save or update entity
        table_client.update_entity(entity=entity, mode='replace')
        logging.info('Entity updated successfully')

        # Get current counts for response
        current_approval_emails = get_approval_emails(entity)
        current_denial_emails = get_denial_emails(entity)
        current_approval_count = len(current_approval_emails)
        current_denial_count = len(current_denial_emails)
        
        # Build approval and denial objects for response
        approvals = {}
        denials = {}
        
        for i, email in enumerate(current_approval_emails, 1):
            approvals[f'approval{i}'] = email
            approvals[f'timeOfApproval{i}'] = entity.get(f'timeOfApproval{i}', '')
        
        for i, email in enumerate(current_denial_emails, 1):
            denials[f'denial{i}'] = email
            denials[f'timeOfDenial{i}'] = entity.get(f'timeOfDenial{i}', '')
        
        # Return success response
        response = {
            "message": response_message,
            "action": action,
            "partitionKey": partition_key,
            "rowKey": row_key,
            "adminCount": admin_count,
            "approvalThreshold": approval_threshold,
            "denialThreshold": denial_threshold,
            "currentApprovalCount": current_approval_count,
            "currentDenialCount": current_denial_count,
            "approvals": approvals,
            "denials": denials,
            "isComplete": current_approval_count >= approval_threshold or current_denial_count >= denial_threshold,
            "isApprovalComplete": current_approval_count >= approval_threshold,
            "isDenialComplete": current_denial_count >= denial_threshold
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
