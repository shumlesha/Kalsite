FROM python:3.10-slim
LABEL maintainer="Shumkov Alex and Dead Fairy"
EXPOSE 8081
WORKDIR /app

COPY requirements.txt ./
RUN pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt

COPY . .

CMD [ "python3", "app.py" ]
