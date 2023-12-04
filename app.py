from flask import Flask, render_template, jsonify, request
from kalfinder import *
from flask_socketio import SocketIO, send, emit
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///nicknames.db'
db = SQLAlchemy(app)
socketio = SocketIO(app, async_mode='eventlet')


class Nickname(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/contacts')
def contacts():
    return render_template('authors.html')


@app.route('/search', methods=['POST'])
def search():
    query = request.form.get('query', "").lower()
    searchresult = fastananlyzer(query) if query.strip() else ""
    #results = {q: a for q, a in questions_answers.items() if query in q.lower() and query}

    return jsonify(searchresult)


@app.route('/check-nickname', methods=['POST'])
def check_nickname():
    nickname = request.json['nickname']
    exists = Nickname.query.filter_by(name=nickname).first()
    return jsonify(exists=bool(exists)), 200

@app.route('/register-nickname', methods=['POST'])
def register_nickname():
    nickname = request.json['nickname']
    exists = Nickname.query.filter_by(name=nickname).first()
    if exists:
        return jsonify(success=False, message="Этот никнейм уже зарегистрирован"), 409
    else:
        new_nickname = Nickname(name=nickname)

        db.session.add(new_nickname)
        db.session.commit()

        socketio.emit('update_user_count', {'new_count': Nickname.query.count()})

        return jsonify(success=True, message="Никнейм успешно зарегистрирован"), 200


@app.route('/get-user-count', methods=['GET'])
def get_user_count():
    user_count = Nickname.query.count()
    return jsonify(user_count=user_count)


# тут обработаем сообщение
@socketio.on('send_message')
def handle_message(data):
    #print(data)
    emit('message', data, broadcast=True)




if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    socketio.run(app, host='0.0.0.0',allow_unsafe_werkzeug=True, port=8081, debug=True)

