import sqlite3
from flask import Flask, request, jsonify, send_from_directory
from flask_login import LoginManager, UserMixin, login_required, login_user, current_user, logout_user
from flask_cors import CORS
import os
from itertools import groupby
import calendar

app = Flask(__name__, static_folder='./build')
app.config['SECRET_KEY'] = 'organized'
CORS(app)

login_manager = LoginManager(app)


class User(UserMixin):
    def __init__(self, id, name, theme=1):
        self.id = int(id)
        self.name = name
        self.theme = theme
        self.authenticated = False

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def is_authenticated(self):
        return self.authenticated

    def get_id(self):
        return self.id

    def get_user(self):
        return {'name': self.name, 'id': self.id, 'theme': self.theme}


def get_db_connection():
    return sqlite3.connect('database.db')


@login_manager.user_loader
def load_user(user_id):
    conn = get_db_connection()
    curs = conn.cursor()

    curs.execute("SELECT * FROM users WHERE user_id = ?", [int(user_id)])
    lu = curs.fetchone()
    if lu is None:
        return None
    else:
        return User(int(lu[0]), lu[1], lu[2])


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


@app.post('/api/login')
def index():
    data = request.json
    name = data['name']

    conn = get_db_connection()
    curs = conn.cursor()

    user = None
    while not user:
        curs.execute("SELECT * FROM users WHERE name = ?", [name])
        user = curs.fetchone()
        if user is not None:
            Us = load_user(user[0])
            login_user(Us, remember=True)

            return jsonify({'user': Us.get_user()})
        else:
            curs.execute('INSERT INTO users(name) VALUES(?)', [name])
            conn.commit()


@login_required
@app.post('/api/day')
def createRecordForDay():
    data = request.json
    day = data['day']
    month = data['month']
    year = data['year']
    time = data['time']
    value = data['value']

    conn = get_db_connection()
    curs = conn.cursor()
    user_id = current_user.id

    curs.execute(
        'SELECT * FROM week_records WHERE(user_id = ? AND day_record = ? AND month_record = ? AND year_record = ? AND '
        'time_record = ?)',
        [user_id, day, month, year, time])

    record = curs.fetchone()

    if record is not None:
        curs.execute(
            'UPDATE week_records SET record = ? WHERE(user_id = ? AND day_record = ? AND month_record = ? AND '
            'year_record = ? AND time_record = ?)',
            [value, user_id, day, month, year, time])
    else:
        curs.execute(
            'INSERT INTO week_records(day_record,month_record,year_record,time_record,record,user_id) VALUES(?,?,?,?,'
            '?,?)',
            [day, month, year, time, value, user_id])
    conn.commit()

    return jsonify({'success': True})


@login_required
@app.get('/api/day')
def getRecordsForDays():
    data = request.args
    day = data['day']
    month = data['month']
    year = data['year']

    conn = get_db_connection()
    curs = conn.cursor()
    user_id = current_user.id

    curs.execute(
        'SELECT * FROM week_records WHERE(user_id = ? AND day_record = ? AND month_record = ? AND year_record = ?)',
        [user_id, day, month, year])

    records = curs.fetchall()

    list_records = {}

    if len(records) > 0:
        for record in records:
            list_records[record[2]] = record[1]

    return jsonify({'records': list_records})


@login_required
@app.post('/api/month/day')
def createRecordForDayInMonth():
    data = request.json
    day = data['day']
    month = data['month']
    year = data['year']
    value = data['record']

    conn = get_db_connection()
    curs = conn.cursor()
    user_id = current_user.id

    curs.execute(
        'SELECT * FROM month_records WHERE(user_id = ? AND day_record = ? AND month_record = ? AND year_record = ?)',
        [user_id, day, month, year])

    record = curs.fetchone()

    if record is not None:
        curs.execute(
            'UPDATE month_records SET record = ? WHERE(user_id = ? AND day_record = ? AND month_record = ? AND '
            'year_record = ?)',
            [value, user_id, day, month, year])
    else:
        curs.execute(
            'INSERT INTO month_records(day_record,month_record,year_record,record,user_id) VALUES(?,?,?,?,?)',
            [day, month, year, value, user_id])
    conn.commit()

    return jsonify({'success': True})


@login_required
@app.post('/api/month/focus')
def createFocusForMonth():
    data = request.json
    month = data['month']
    year = data['year']
    focus = data['focus']

    conn = get_db_connection()
    curs = conn.cursor()
    user_id = current_user.id

    curs.execute(
        'SELECT * FROM focuses_month WHERE(user_id = ? AND month_record = ? AND year_record = ?)',
        [user_id, month, year])

    record = curs.fetchone()

    if record is not None:
        curs.execute(
            'UPDATE focuses_month SET focus = ? WHERE(user_id = ? AND month_record = ? AND '
            'year_record = ?)',
            [focus, user_id, month, year])
    else:
        curs.execute(
            'INSERT INTO focuses_month(month_record,year_record,focus,user_id) VALUES(?,?,?,?)',
            [month, year, focus, user_id])
    conn.commit()

    return jsonify({'success': True})


@login_required
@app.get('/api/month')
def getRecordsForMonth():
    data = request.args
    month = data['month']
    year = data['year']

    conn = get_db_connection()
    curs = conn.cursor()
    user_id = current_user.id

    curs.execute(
        'SELECT * FROM month_records WHERE(user_id = ? AND month_record = ? AND year_record = ?)',
        [user_id, month, year])

    records = curs.fetchall()

    list_records = {}

    if len(records) > 0:
        for record in records:
            list_records[record[2]] = record[1]

    curs.execute(
        'SELECT * FROM focuses_month WHERE(user_id = ? AND month_record = ? AND year_record = ?)',
        [user_id, month, year])

    focus_db = curs.fetchone()
    focus = focus_db[1] if focus_db is not None else None

    return jsonify({'records': list_records, 'focus': focus})


@login_required
@app.post('/api/tracker')
def saveTableInTracker():
    data = request.json
    rows = data['rows']
    month = data['month']
    year = data['year']

    conn = get_db_connection()
    curs = conn.cursor()
    user_id = current_user.id

    curs.execute(
        'DELETE FROM tracker WHERE(user_id = ? AND month_record = ? AND year_record = ?)',
        [user_id, month, year])
    conn.commit()

    for row in rows:
        track = row['name']
        for i, value in enumerate(row['values']):
            if value == 1:
                curs.execute(
                    'INSERT INTO tracker(track,day_record,month_record,year_record,user_id) VALUES(?,?,?,?,?)',
                    [track, i + 1, month, year, user_id])
                conn.commit()

    return jsonify({'success': True})


@login_required
@app.get('/api/tracker')
def getRowsForTracker():
    data = request.args
    month = data['month']
    year = data['year']

    conn = get_db_connection()
    curs = conn.cursor()
    user_id = current_user.id

    curs.execute(
        'SELECT * FROM tracker WHERE(user_id = ? AND month_record = ? AND year_record = ?)',
        [user_id, month, year])

    records = curs.fetchall()
    list_records = {}

    days_in_month = calendar.monthrange(int(year), int(month))[1]

    if len(records) > 0:
        for record in records:
            list_records[record[1]] = []
    for name, row_iter in groupby(records, key=lambda r: r[1]):
        row = list(row_iter)
        list_checked_days = [cells[2] for cells in row]
        days = [0] * days_in_month
        for day in list_checked_days:
            days[day - 1] = 1
        list_records[name] = days

    return jsonify({'rows': list_records})


@login_required
@app.post('/api/settings/name')
def changeName():
    data = request.json
    name = data['name']

    conn = get_db_connection()
    curs = conn.cursor()
    user_id = current_user.id

    curs.execute(
        'UPDATE users SET name = ? WHERE(user_id = ?)',
        [name, user_id])
    conn.commit()
    logout_user()

    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True)
