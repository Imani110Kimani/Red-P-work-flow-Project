import logging
import azure.functions as func
import os
import requests
from azure.cognitiveservices.vision.face import FaceClient
from msrest.authentication import CognitiveServicesCredentials

# Set these as environment variables or in your function app settings
FACE_ENDPOINT = os.environ.get('FACE_ENDPOINT')
FACE_KEY = os.environ.get('FACE_KEY')

face_client = FaceClient(FACE_ENDPOINT, CognitiveServicesCredentials(FACE_KEY))


import base64
from io import BytesIO

def detect_face(image_url=None, image_base64=None):
    if image_base64:
        # Remove header if present
        if image_base64.startswith('data:image'):
            image_base64 = image_base64.split(',')[1]
        image_bytes = base64.b64decode(image_base64)
        stream = BytesIO(image_bytes)
        detected_faces = face_client.face.detect_with_stream(
            image=stream,
            detection_model='detection_03',
            recognition_model='recognition_04',
            return_face_id=True
        )
    elif image_url:
        detected_faces = face_client.face.detect_with_url(
            url=image_url,
            detection_model='detection_03',
            recognition_model='recognition_04',
            return_face_id=True
        )
    else:
        return None
    if not detected_faces:
        return None
    return detected_faces[0].face_id

def compare_faces(face_id1, face_id2):
    verify_result = face_client.face.verify_face_to_face(face_id1, face_id2)
    return verify_result.is_identical, verify_result.confidence

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('FaceID verification HTTP trigger function processed a request.')

    try:
        data = req.get_json()
        # Support both base64 and url for single image verification
        image_base64 = data.get('image_base64')
        image_url1 = data.get('image_url1')
        image_url2 = data.get('image_url2')
        image_base64_2 = data.get('image_base64_2')

        # If both base64 images are provided, compare them
        if image_base64 and image_base64_2:
            face_id1 = detect_face(image_base64=image_base64)
            face_id2 = detect_face(image_base64=image_base64_2)
        # If one base64 and one url, compare them
        elif image_base64 and image_url2:
            face_id1 = detect_face(image_base64=image_base64)
            face_id2 = detect_face(image_url=image_url2)
        elif image_url1 and image_base64_2:
            face_id1 = detect_face(image_url=image_url1)
            face_id2 = detect_face(image_base64=image_base64_2)
        # If only one image (base64 or url), just detect and return faceId
        elif image_base64:
            face_id1 = detect_face(image_base64=image_base64)
            if not face_id1:
                return func.HttpResponse('Could not detect face in image.', status_code=400)
            return func.HttpResponse(
                f'{{"face_id": "{face_id1}"}}',
                mimetype='application/json',
                status_code=200
            )
        elif image_url1:
            face_id1 = detect_face(image_url=image_url1)
            if not face_id1:
                return func.HttpResponse('Could not detect face in image.', status_code=400)
            return func.HttpResponse(
                f'{{"face_id": "{face_id1}"}}',
                mimetype='application/json',
                status_code=200
            )
        # If two URLs, compare them
        elif image_url1 and image_url2:
            face_id1 = detect_face(image_url=image_url1)
            face_id2 = detect_face(image_url=image_url2)
        else:
            return func.HttpResponse(
                'Please provide at least one image (image_base64 or image_url1).',
                status_code=400
            )

        if not face_id1 or not face_id2:
            return func.HttpResponse('Could not detect faces in one or both images.', status_code=400)
        is_identical, confidence = compare_faces(face_id1, face_id2)
        return func.HttpResponse(
            f'{{"is_identical": {is_identical}, "confidence": {confidence}}}',
            mimetype='application/json',
            status_code=200
        )
    except Exception as e:
        logging.error(str(e))
        return func.HttpResponse(f'Error: {str(e)}', status_code=500)
