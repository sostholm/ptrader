# import time

import json
import os
from pywebpush import webpush, WebPushException

VAPID_PRIVATE_KEY = None
VAPID_PUBLIC_KEY = None

if 'VAPID_PKEY' in os.environ:
    VAPID_PRIVATE_KEY = os.environ["VAPID_PKEY"]
else:
    VAPID_PRIVATE_KEY = open('/run/secrets/vapid_key_txt', "r+").readline().strip("\n")

if 'VAPID_PUBLIC_KEY' in os.environ:
    VAPID_PRIVATE_KEY = os.environ["VAPID_PUBLIC_KEY"]
else:
    VAPID_PUBLIC_KEY = open('/run/secrets/vapid_public_key_txt', "r+").read().strip("\n")

VAPID_CLAIMS = {
"sub": "mailto:eekoren@hotmail.com"
}
 
def send_web_push(subscription_information, message_body):
    return webpush(
        subscription_info=subscription_information,
        data=message_body,
        vapid_private_key=VAPID_PRIVATE_KEY,
        vapid_claims=VAPID_CLAIMS
    )

if __name__ == "__main__":
    response = send_web_push(subscription_info, "this is just a test")
    print('completed')