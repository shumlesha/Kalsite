FROM python:3.8-slim
LABEL maintainer="Shumkov Alex and Dead Fairy"

WORKDIR /app

COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY . .

CMD [ "python3", "app.py" ]
