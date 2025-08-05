import azure.functions as func
import json
import logging
import random
import string
from datetime import datetime, timedelta
from azure.data.tables import TableServiceClient, TableEntity
import os
from dotenv import load_dotenv
import requests

# Load environment variables from .env file (for local development)
try:
    load_dotenv()
    logging.info("✅ Loaded .env file successfully")
except Exception as env_error:
    logging.warning(f"Could not load .env file: {env_error}")

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

# Azure Table Storage configuration
AZURE_STORAGE_CONNECTION_STRING = os.environ.get('AZURE_STORAGE_CONNECTION_STRING')
TABLE_NAME = os.environ.get('TABLE_NAME', 'AuthCodes')  # Updated default to match .env
VERIFICATION_CODE_EXPIRY_MINUTES = int(os.environ.get('VERIFICATION_CODE_EXPIRY_MINUTES', '10'))

# Power Automate Flow configuration
POWER_AUTOMATE_URL = os.environ.get('POWER_AUTOMATE_URL')

# Enhanced logging for debugging
logging.info("=== Azure Function Starting ===")
logging.info(f"Connection string exists: {bool(AZURE_STORAGE_CONNECTION_STRING)}")
if AZURE_STORAGE_CONNECTION_STRING:
    # Log account name for verification (safe to log)
    if 'AccountName=' in AZURE_STORAGE_CONNECTION_STRING:
        start = AZURE_STORAGE_CONNECTION_STRING.find('AccountName=') + 12
        end = AZURE_STORAGE_CONNECTION_STRING.find(';', start)
        account = AZURE_STORAGE_CONNECTION_STRING[start:end] if end > start else AZURE_STORAGE_CONNECTION_STRING[start:]
        logging.info(f"Storage Account: {account}")
logging.info(f"Table Name: {TABLE_NAME}")
logging.info(f"Expiry Minutes: {VERIFICATION_CODE_EXPIRY_MINUTES}")
logging.info(f"Power Automate URL configured: {bool(POWER_AUTOMATE_URL)}")

# Validate required environment variables
if not AZURE_STORAGE_CONNECTION_STRING:
    error_msg = "AZURE_STORAGE_CONNECTION_STRING environment variable is required"
    logging.error(error_msg)
    raise ValueError(error_msg)

if not POWER_AUTOMATE_URL:
    logging.warning("POWER_AUTOMATE_URL not configured - emails will not be sent")

logging.info(f"Azure Function initialized with table: {TABLE_NAME}")
logging.info(f"Verification code expiry: {VERIFICATION_CODE_EXPIRY_MINUTES} minutes")

def get_table_client():
    """Get Azure Table Storage client"""
    try:
        logging.info(f"Attempting to connect to Azure Table Storage")
        logging.info(f"Connection string exists: {bool(AZURE_STORAGE_CONNECTION_STRING)}")
        logging.info(f"Table name: {TABLE_NAME}")
        
        table_service_client = TableServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
        table_client = table_service_client.get_table_client(table_name=TABLE_NAME)
        
        # Test the connection by trying to get table properties
        try:
            properties = table_client.get_table_properties()
            logging.info(f"Table '{TABLE_NAME}' exists and is accessible")
        except Exception as props_error:
            logging.info(f"Table might not exist, attempting to create: {str(props_error)}")
            try:
                table_client.create_table()
                logging.info(f"Successfully created table: {TABLE_NAME}")
            except Exception as create_error:
                if "TableAlreadyExists" in str(create_error) or "already exists" in str(create_error).lower():
                    logging.info(f"Table '{TABLE_NAME}' already exists")
                else:
                    logging.error(f"Failed to create table: {str(create_error)}")
                    raise
        
        return table_client
    except Exception as e:
        logging.error(f"Failed to connect to Azure Table Storage: {str(e)}")
        logging.error(f"Connection string preview: {AZURE_STORAGE_CONNECTION_STRING[:50]}..." if AZURE_STORAGE_CONNECTION_STRING else "None")
        raise

def generate_verification_code():
    """Generate a 6-character random code using lowercase letters and numbers"""
    characters = string.ascii_lowercase + string.digits
    return ''.join(random.choice(characters) for _ in range(6))

def send_verification_email(email, verification_code):
    """Send verification code via email using Power Automate flow"""
    try:
        if not POWER_AUTOMATE_URL:
            logging.warning("Power Automate URL not configured - skipping email")
            return False
        
        # Prepare payload for Power Automate flow
        payload = {
            "email": email,
            "code": verification_code
        }
        
        # Send request to Power Automate flow
        headers = {
            "Content-Type": "application/json"
        }
        
        logging.info(f"Triggering Power Automate flow for email: {email}")
        response = requests.post(POWER_AUTOMATE_URL, headers=headers, json=payload, timeout=30)
        
        if response.status_code in [200, 202]:
            logging.info(f"Power Automate flow triggered successfully for {email}. Status code: {response.status_code}")
            return True
        else:
            logging.error(f"Failed to trigger Power Automate flow. Status: {response.status_code}, Response: {response.text}")
            return False
        
    except Exception as e:
        logging.error(f"Failed to trigger Power Automate flow for {email}: {str(e)}")
        return False

def cleanup_expired_entities(table_client):
    """Remove entities older than the configured expiry time"""
    try:
        cutoff_time = datetime.utcnow() - timedelta(minutes=VERIFICATION_CODE_EXPIRY_MINUTES)
        
        # Query for expired entities using our CreatedAt field
        # Format: YYYY-MM-DDTHH:MM:SS.fffffZ
        filter_query = f"CreatedAt lt '{cutoff_time.isoformat()}Z'"
        logging.info(f"Cleanup filter: {filter_query}")
        
        expired_entities = table_client.query_entities(query_filter=filter_query)
        
        # Delete expired entities
        deleted_count = 0
        for entity in expired_entities:
            try:
                table_client.delete_entity(
                    partition_key=entity['PartitionKey'],
                    row_key=entity['RowKey']
                )
                deleted_count += 1
                logging.info(f"Deleted expired entity: {entity['PartitionKey']}/{entity['RowKey']}")
            except Exception as e:
                logging.warning(f"Failed to delete entity {entity['PartitionKey']}/{entity['RowKey']}: {str(e)}")
        
        logging.info(f"Cleaned up {deleted_count} expired entities")
        return deleted_count
    except Exception as e:
        logging.error(f"Error during cleanup: {str(e)}")
        return 0

@app.route(route="generate-code", methods=["POST"])
def generate_code(req: func.HttpRequest) -> func.HttpResponse:
    """
    Endpoint to generate a verification code for an email
    Expects JSON body with 'email' field
    """
    logging.info('Generate code endpoint called')
    
    try:
        # Parse request body
        req_body = req.get_json()
        if not req_body or 'email' not in req_body:
            return func.HttpResponse(
                json.dumps({"error": "Email is required in request body"}),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )
        
        email = req_body['email'].lower().strip()
        
        # Validate email format (basic validation)
        if '@' not in email or '.' not in email:
            return func.HttpResponse(
                json.dumps({"error": "Invalid email format"}),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )
        
        # Generate verification code
        verification_code = generate_verification_code()
        logging.info(f"Generated verification code: {verification_code} for email: {email}")
        
        # Get table client
        try:
            table_client = get_table_client()
            logging.info("Successfully obtained table client")
        except Exception as table_error:
            logging.error(f"Failed to get table client: {str(table_error)}")
            return func.HttpResponse(
                json.dumps({"error": f"Database connection failed: {str(table_error)}"}),
                status_code=500,
                headers={"Content-Type": "application/json"}
            )
        
        # Create entity
        try:
            entity = TableEntity()
            entity['PartitionKey'] = email
            entity['RowKey'] = verification_code
            # Add our own timestamp since Azure's Timestamp might not be immediately available
            entity['CreatedAt'] = datetime.utcnow().isoformat() + 'Z'
            
            logging.info(f"Creating entity: PartitionKey={email}, RowKey={verification_code}")
            
            # Insert entity into table
            result = table_client.create_entity(entity=entity)
            logging.info(f"Successfully inserted entity into table.")
            
        except Exception as entity_error:
            logging.error(f"Failed to create/insert entity: {str(entity_error)}")
            logging.error(f"Entity data: PartitionKey={email}, RowKey={verification_code}")
            return func.HttpResponse(
                json.dumps({"error": f"Failed to save verification code: {str(entity_error)}"}),
                status_code=500,
                headers={"Content-Type": "application/json"}
            )
        
        # Send verification email
        email_sent = send_verification_email(email, verification_code)
        
        logging.info(f"Generated verification code for email: {email}")
        
        response_data = {
            "message": "Verification code generated successfully",
            "email": email,
            "code": verification_code,  # Remove this in production for security
            "email_sent": email_sent
        }
        
        return func.HttpResponse(
            json.dumps(response_data),
            status_code=200,
            headers={"Content-Type": "application/json"}
        )
        
    except Exception as e:
        logging.error(f"Error generating verification code: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": "Internal server error"}),
            status_code=500,
            headers={"Content-Type": "application/json"}
        )

@app.route(route="verify-code", methods=["POST"])
def verify_code(req: func.HttpRequest) -> func.HttpResponse:
    """
    Endpoint to verify an email and code combination
    Expects JSON body with 'email' and 'code' fields
    Also cleans up expired entities
    """
    logging.info('Verify code endpoint called')
    
    try:
        # Parse request body
        req_body = req.get_json()
        if not req_body or 'email' not in req_body or 'code' not in req_body:
            return func.HttpResponse(
                json.dumps({"error": "Email and code are required in request body"}),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )
        
        email = req_body['email'].lower().strip()
        code = req_body['code'].lower().strip()
        
        logging.info(f"Verification request - Email: {email}, Code: {code}")
        
        # Get table client
        table_client = get_table_client()
        
        # Clean up expired entities first
        cleanup_expired_entities(table_client)
        
        try:
            # Try to get the entity
            logging.info(f"Looking for entity: PartitionKey='{email}', RowKey='{code}'")
            entity = table_client.get_entity(partition_key=email, row_key=code)
            logging.info(f"SUCCESS: Found entity: {entity}")
            
            # Check if the entity exists and is within the expiry window
            # Try both our CreatedAt and Azure's Timestamp
            entity_timestamp = entity.get('CreatedAt') or entity.get('Timestamp')
            logging.info(f"Entity timestamp: {entity_timestamp} (type: {type(entity_timestamp)})")
            logging.info(f"Available entity keys: {list(entity.keys())}")
            
            if entity_timestamp:
                # Handle different timestamp formats from Azure
                try:
                    if isinstance(entity_timestamp, str):
                        # Remove 'Z' and parse as UTC
                        timestamp_str = entity_timestamp.replace('Z', '+00:00')
                        entity_time = datetime.fromisoformat(timestamp_str)
                    else:
                        # Already a datetime object
                        entity_time = entity_timestamp
                    
                    # Convert to UTC naive datetime for comparison
                    if entity_time.tzinfo:
                        entity_time = entity_time.replace(tzinfo=None)
                    
                    current_time = datetime.utcnow()
                    time_diff = current_time - entity_time
                    
                    logging.info(f"Entity time: {entity_time}")
                    logging.info(f"Current time: {current_time}")
                    logging.info(f"Time difference: {time_diff}")
                    logging.info(f"Expiry limit: {VERIFICATION_CODE_EXPIRY_MINUTES} minutes")
                    
                    if time_diff <= timedelta(minutes=VERIFICATION_CODE_EXPIRY_MINUTES):
                        # Valid verification
                        logging.info(f"Successful verification for email: {email}")
                        
                        # Delete the used code
                        try:
                            table_client.delete_entity(partition_key=email, row_key=code)
                            logging.info(f"Deleted used verification code for email: {email}")
                        except Exception as delete_error:
                            logging.warning(f"Failed to delete used code: {str(delete_error)}")
                        
                        return func.HttpResponse(
                            json.dumps({
                                "message": "Verification successful",
                                "email": email,
                                "verified": True
                            }),
                            status_code=200,
                            headers={"Content-Type": "application/json"}
                        )
                    else:
                        # Code expired
                        logging.info(f"Code expired for email: {email}. Time diff: {time_diff}")
                        try:
                            table_client.delete_entity(partition_key=email, row_key=code)
                            logging.info(f"Deleted expired code for email: {email}")
                        except Exception as delete_error:
                            logging.warning(f"Failed to delete expired code: {str(delete_error)}")
                        
                        return func.HttpResponse(
                            json.dumps({
                                "message": "Verification code has expired",
                                "verified": False
                            }),
                            status_code=400,
                            headers={"Content-Type": "application/json"}
                        )
                        
                except Exception as time_parse_error:
                    logging.error(f"Failed to parse timestamp: {time_parse_error}")
                    return func.HttpResponse(
                        json.dumps({
                            "message": "Invalid verification code",
                            "verified": False
                        }),
                        status_code=400,
                        headers={"Content-Type": "application/json"}
                    )
            else:
                logging.warning(f"No timestamp found in entity for email: {email}")
                return func.HttpResponse(
                    json.dumps({
                        "message": "Invalid verification code",
                        "verified": False
                    }),
                    status_code=400,
                    headers={"Content-Type": "application/json"}
                )
                
        except Exception as get_error:
            # Entity not found or other error
            logging.error(f"FAILED to find entity for email '{email}' with code '{code}': {str(get_error)}")
            logging.error(f"Error type: {type(get_error).__name__}")
            
            # Let's also try to list all entities for this email to debug
            try:
                logging.info(f"DEBUG: Listing all entities for email '{email}':")
                filter_query = f"PartitionKey eq '{email}'"
                entities = table_client.query_entities(query_filter=filter_query)
                entity_count = 0
                for entity in entities:
                    entity_count += 1
                    logging.info(f"  Entity {entity_count}: PartitionKey='{entity.get('PartitionKey')}', RowKey='{entity.get('RowKey')}', Timestamp={entity.get('Timestamp')}")
                
                if entity_count == 0:
                    logging.info(f"  No entities found for email '{email}'")
                else:
                    logging.info(f"  Total entities found: {entity_count}")
                    
            except Exception as list_error:
                logging.error(f"Failed to list entities for debugging: {str(list_error)}")
            
            return func.HttpResponse(
                json.dumps({
                    "message": "Invalid verification code",
                    "verified": False
                }),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )
        
    except Exception as e:
        logging.error(f"Error verifying code: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": "Internal server error"}),
            status_code=500,
            headers={"Content-Type": "application/json"}
        )
