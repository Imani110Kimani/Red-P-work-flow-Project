import json
import logging
import os
from datetime import datetime, timezone
from typing import Optional
import azure.functions as func
from azure.data.tables import TableServiceClient, TableEntity
from azure.core.exceptions import ResourceExistsError, ResourceNotFoundError
from azure.identity import DefaultAzureCredential
from dotenv import load_dotenv

# Load environment variables from .env file for local development
load_dotenv()

# Initialize the Azure Functions app
app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

# Azure Table Storage configuration
STORAGE_ACCOUNT_NAME = os.environ.get('AZURE_STORAGE_ACCOUNT_NAME')
ADMIN_TABLE_NAME = os.environ.get('ADMIN_TABLE_NAME')
AZURE_STORAGE_CONNECTION_STRING = os.environ.get('AzureWebJobsStorage')

def get_table_client():
    """Get Azure Table Storage client using connection string"""
    try:
        # Use connection string for authentication
        logging.info(f"Using connection string for Azure Table Storage")
        
        if not AZURE_STORAGE_CONNECTION_STRING:
            raise ValueError("AzureWebJobsStorage connection string not found in environment variables")
        
        table_service_client = TableServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
        table_client = table_service_client.get_table_client(table_name=ADMIN_TABLE_NAME)
        
        # Create table if it doesn't exist
        try:
            table_client.create_table()
            logging.info(f"Created table {ADMIN_TABLE_NAME}")
        except ResourceExistsError:
            logging.info(f"Table {ADMIN_TABLE_NAME} already exists")
        
        return table_client
    except Exception as e:
        logging.error(f"Failed to connect to Azure Table Storage: {str(e)}")
        raise

def validate_email(email: str) -> bool:
    """Basic email validation"""
    return "@" in email and "." in email.split("@")[1]

def check_super_admin_permission(requester_email: str) -> bool:
    """Check if the requester has super_admin permissions"""
    try:
        table_client = get_table_client()
        
        # Query for the requester's admin record
        try:
            admin_entity = table_client.get_entity(partition_key="admins", row_key=requester_email)
            return admin_entity.get('Role') == 'super_admin'
        except ResourceNotFoundError:
            logging.warning(f"Admin record not found for {requester_email}")
            return False
            
    except Exception as e:
        logging.error(f"Error checking super admin permission: {str(e)}")
        return False

@app.route(route="create-admin", methods=["POST"])
def create_admin(req: func.HttpRequest) -> func.HttpResponse:
    """
    Create a new admin user
    Expected JSON body:
    {
        "requester_email": "superadmin@example.com",
        "new_admin_email": "newadmin@example.com"
    }
    """
    logging.info('Create admin function triggered')
    
    try:
        # Parse request body
        try:
            req_body = req.get_json()
        except ValueError:
            return func.HttpResponse(
                json.dumps({"error": "Invalid JSON in request body"}),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )
        
        if not req_body:
            return func.HttpResponse(
                json.dumps({"error": "Request body is required"}),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )
        
        # Extract and validate required fields
        requester_email = req_body.get('requester_email')
        new_admin_email = req_body.get('new_admin_email')
        
        if not requester_email or not new_admin_email:
            return func.HttpResponse(
                json.dumps({"error": "Both 'requester_email' and 'new_admin_email' are required"}),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )
        
        # Validate email formats
        if not validate_email(requester_email) or not validate_email(new_admin_email):
            return func.HttpResponse(
                json.dumps({"error": "Invalid email format"}),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )
        
        # Check if requester has super_admin permissions
        if not check_super_admin_permission(requester_email):
            return func.HttpResponse(
                json.dumps({"error": "Access denied. Only super_admin users can create new admins"}),
                status_code=403,
                headers={"Content-Type": "application/json"}
            )
        
        # Get table client
        table_client = get_table_client()
        
        # Check if admin already exists
        try:
            existing_admin = table_client.get_entity(partition_key="admins", row_key=new_admin_email)
            return func.HttpResponse(
                json.dumps({"error": f"Admin with email {new_admin_email} already exists"}),
                status_code=409,
                headers={"Content-Type": "application/json"}
            )
        except ResourceNotFoundError:
            # Admin doesn't exist, which is what we want
            pass
        
        # Create new admin entity
        current_timestamp = datetime.now(timezone.utc).isoformat()
        
        new_admin_entity = {
            "PartitionKey": "admins",
            "RowKey": new_admin_email,
            "Role": "admin",
            "CreatedAt": current_timestamp,
            "LastLogin": current_timestamp  # Set to created time initially
        }
        
        # Insert the new admin
        table_client.create_entity(entity=new_admin_entity)
        
        logging.info(f"Successfully created admin user: {new_admin_email} by {requester_email}")
        
        # Return success response (excluding sensitive information)
        response_data = {
            "success": True,
            "message": f"Admin user {new_admin_email} created successfully",
            "admin": {
                "email": new_admin_email,
                "role": "admin",
                "created_at": current_timestamp
            }
        }
        
        return func.HttpResponse(
            json.dumps(response_data),
            status_code=201,
            headers={"Content-Type": "application/json"}
        )
        
    except Exception as e:
        logging.error(f"Error creating admin user: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": f"Internal server error: {str(e)}"}),
            status_code=500,
            headers={"Content-Type": "application/json"}
        )

@app.route(route="read-admin", methods=["GET"])
def read_admin(req: func.HttpRequest) -> func.HttpResponse:
    """
    Read admin user(s)
    Query parameters:
    - email (optional): If provided, returns specific admin info. If not provided, returns all admins with emails and roles.
    """
    logging.info('Read admin function triggered')
    
    try:
        # Get email from query parameters
        email = req.params.get('email')
        
        # Get table client
        table_client = get_table_client()
        
        if email:
            # Return specific admin information
            if not validate_email(email):
                return func.HttpResponse(
                    json.dumps({"error": "Invalid email format"}),
                    status_code=400,
                    headers={"Content-Type": "application/json"}
                )
            
            try:
                admin_entity = table_client.get_entity(partition_key="admins", row_key=email)
                
                # Return all admin information
                admin_info = {
                    "email": admin_entity.get('RowKey'),
                    "role": admin_entity.get('Role'),
                    "created_at": admin_entity.get('CreatedAt'),
                    "last_login": admin_entity.get('LastLogin')
                }
                
                response_data = {
                    "success": True,
                    "admin": admin_info
                }
                
                return func.HttpResponse(
                    json.dumps(response_data),
                    status_code=200,
                    headers={"Content-Type": "application/json"}
                )
                
            except ResourceNotFoundError:
                return func.HttpResponse(
                    json.dumps({"error": f"Admin with email {email} not found"}),
                    status_code=404,
                    headers={"Content-Type": "application/json"}
                )
        
        else:
            # Return all admins with emails and roles only
            try:
                # Query all entities in the admins partition
                admin_entities = table_client.query_entities("PartitionKey eq 'admins'")
                
                admins_list = []
                for entity in admin_entities:
                    admin_summary = {
                        "email": entity.get('RowKey'),
                        "role": entity.get('Role')
                    }
                    admins_list.append(admin_summary)
                
                response_data = {
                    "success": True,
                    "admins": admins_list,
                    "count": len(admins_list)
                }
                
                return func.HttpResponse(
                    json.dumps(response_data),
                    status_code=200,
                    headers={"Content-Type": "application/json"}
                )
                
            except Exception as e:
                logging.error(f"Error querying all admins: {str(e)}")
                return func.HttpResponse(
                    json.dumps({"error": f"Error retrieving admin list: {str(e)}"}),
                    status_code=500,
                    headers={"Content-Type": "application/json"}
                )
        
    except Exception as e:
        logging.error(f"Error reading admin user(s): {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": f"Internal server error: {str(e)}"}),
            status_code=500,
            headers={"Content-Type": "application/json"}
        )

@app.route(route="update-admin", methods=["PUT"])
def update_admin(req: func.HttpRequest) -> func.HttpResponse:
    """
    Transfer super_admin privileges from one admin to another
    Expected JSON body:
    {
        "current_super_admin_email": "currentsuper@example.com",
        "new_super_admin_email": "newsuper@example.com"
    }
    """
    logging.info('Update admin function triggered')
    
    try:
        # Parse request body
        try:
            req_body = req.get_json()
        except ValueError:
            return func.HttpResponse(
                json.dumps({"error": "Invalid JSON in request body"}),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )
        
        if not req_body:
            return func.HttpResponse(
                json.dumps({"error": "Request body is required"}),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )
        
        # Extract and validate required fields
        current_super_admin_email = req_body.get('current_super_admin_email')
        new_super_admin_email = req_body.get('new_super_admin_email')
        
        if not current_super_admin_email or not new_super_admin_email:
            return func.HttpResponse(
                json.dumps({"error": "Both 'current_super_admin_email' and 'new_super_admin_email' are required"}),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )
        
        # Validate email formats
        if not validate_email(current_super_admin_email) or not validate_email(new_super_admin_email):
            return func.HttpResponse(
                json.dumps({"error": "Invalid email format"}),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )
        
        # Prevent transferring to the same email
        if current_super_admin_email.lower() == new_super_admin_email.lower():
            return func.HttpResponse(
                json.dumps({"error": "Cannot transfer super_admin privileges to the same email address"}),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )
        
        # Get table client
        table_client = get_table_client()
        
        # Verify current user is super_admin
        try:
            current_admin_entity = table_client.get_entity(partition_key="admins", row_key=current_super_admin_email)
            if current_admin_entity.get('Role') != 'super_admin':
                return func.HttpResponse(
                    json.dumps({"error": "Access denied. Only super_admin users can transfer privileges"}),
                    status_code=403,
                    headers={"Content-Type": "application/json"}
                )
        except ResourceNotFoundError:
            return func.HttpResponse(
                json.dumps({"error": f"Current admin {current_super_admin_email} not found"}),
                status_code=404,
                headers={"Content-Type": "application/json"}
            )
        
        # Verify new admin exists
        try:
            new_admin_entity = table_client.get_entity(partition_key="admins", row_key=new_super_admin_email)
        except ResourceNotFoundError:
            return func.HttpResponse(
                json.dumps({"error": f"Target admin {new_super_admin_email} not found"}),
                status_code=404,
                headers={"Content-Type": "application/json"}
            )
        
        # Update both entities
        current_timestamp = datetime.now(timezone.utc).isoformat()
        
        # Update current super_admin to regular admin
        current_admin_entity['Role'] = 'admin'
        table_client.update_entity(mode='replace', entity=current_admin_entity)
        
        # Update new admin to super_admin
        new_admin_entity['Role'] = 'super_admin'
        table_client.update_entity(mode='replace', entity=new_admin_entity)
        
        logging.info(f"Successfully transferred super_admin privileges from {current_super_admin_email} to {new_super_admin_email}")
        
        # Return success response
        response_data = {
            "success": True,
            "message": f"Super admin privileges transferred from {current_super_admin_email} to {new_super_admin_email}",
            "transfer": {
                "previous_super_admin": {
                    "email": current_super_admin_email,
                    "new_role": "admin"
                },
                "new_super_admin": {
                    "email": new_super_admin_email,
                    "new_role": "super_admin"
                },
                "transferred_at": current_timestamp
            }
        }
        
        return func.HttpResponse(
            json.dumps(response_data),
            status_code=200,
            headers={"Content-Type": "application/json"}
        )
        
    except Exception as e:
        logging.error(f"Error transferring super admin privileges: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": f"Internal server error: {str(e)}"}),
            status_code=500,
            headers={"Content-Type": "application/json"}
        )

@app.route(route="delete-admin", methods=["DELETE"])
def delete_admin(req: func.HttpRequest) -> func.HttpResponse:
    """
    Delete an admin user
    Expected JSON body:
    {
        "requester_email": "superadmin@example.com",
        "admin_to_delete_email": "admin@example.com"
    }
    """
    logging.info('Delete admin function triggered')
    
    try:
        # Parse request body
        try:
            req_body = req.get_json()
        except ValueError:
            return func.HttpResponse(
                json.dumps({"error": "Invalid JSON in request body"}),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )
        
        if not req_body:
            return func.HttpResponse(
                json.dumps({"error": "Request body is required"}),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )
        
        # Extract and validate required fields
        requester_email = req_body.get('requester_email')
        admin_to_delete_email = req_body.get('admin_to_delete_email')
        
        if not requester_email or not admin_to_delete_email:
            return func.HttpResponse(
                json.dumps({"error": "Both 'requester_email' and 'admin_to_delete_email' are required"}),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )
        
        # Validate email formats
        if not validate_email(requester_email) or not validate_email(admin_to_delete_email):
            return func.HttpResponse(
                json.dumps({"error": "Invalid email format"}),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )
        
        # Prevent deleting own account
        if requester_email.lower() == admin_to_delete_email.lower():
            return func.HttpResponse(
                json.dumps({"error": "Cannot delete your own admin account"}),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )
        
        # Get table client
        table_client = get_table_client()
        
        # Verify requester is super_admin
        try:
            requester_entity = table_client.get_entity(partition_key="admins", row_key=requester_email)
            if requester_entity.get('Role') != 'super_admin':
                return func.HttpResponse(
                    json.dumps({"error": "Access denied. Only super_admin users can delete admins"}),
                    status_code=403,
                    headers={"Content-Type": "application/json"}
                )
        except ResourceNotFoundError:
            return func.HttpResponse(
                json.dumps({"error": f"Requester admin {requester_email} not found"}),
                status_code=404,
                headers={"Content-Type": "application/json"}
            )
        
        # Verify admin to delete exists and get their info before deletion
        try:
            admin_to_delete_entity = table_client.get_entity(partition_key="admins", row_key=admin_to_delete_email)
            admin_role = admin_to_delete_entity.get('Role')
            
            # Prevent deleting the last super_admin
            if admin_role == 'super_admin':
                # Count total super_admins
                super_admin_entities = table_client.query_entities("PartitionKey eq 'admins' and Role eq 'super_admin'")
                super_admin_count = sum(1 for _ in super_admin_entities)
                
                if super_admin_count <= 1:
                    return func.HttpResponse(
                        json.dumps({"error": "Cannot delete the last super_admin. Transfer privileges to another admin first"}),
                        status_code=409,
                        headers={"Content-Type": "application/json"}
                    )
            
        except ResourceNotFoundError:
            return func.HttpResponse(
                json.dumps({"error": f"Admin to delete {admin_to_delete_email} not found"}),
                status_code=404,
                headers={"Content-Type": "application/json"}
            )
        
        # Delete the admin
        table_client.delete_entity(partition_key="admins", row_key=admin_to_delete_email)
        
        current_timestamp = datetime.now(timezone.utc).isoformat()
        
        logging.info(f"Successfully deleted admin user: {admin_to_delete_email} by {requester_email}")
        
        # Return success response
        response_data = {
            "success": True,
            "message": f"Admin user {admin_to_delete_email} deleted successfully",
            "deleted_admin": {
                "email": admin_to_delete_email,
                "role": admin_role,
                "deleted_by": requester_email,
                "deleted_at": current_timestamp
            }
        }
        
        return func.HttpResponse(
            json.dumps(response_data),
            status_code=200,
            headers={"Content-Type": "application/json"}
        )
        
    except Exception as e:
        logging.error(f"Error deleting admin user: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": f"Internal server error: {str(e)}"}),
            status_code=500,
            headers={"Content-Type": "application/json"}
        )
