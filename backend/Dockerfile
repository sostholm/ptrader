FROM python:3.8-buster

COPY /src/ /app/

COPY requirements.txt /app/

WORKDIR /app

RUN python3 --version
RUN python3 -m pip install -r requirements.txt

RUN mkdir /app/secrets
 
CMD ["uvicorn", "app:app", "--ssl-keyfile=/app/secrets/pine64.key", "--ssl-certfile=/app/secrets/pine64.crt", "--host", "0.0.0.0", "--port", "8000"]