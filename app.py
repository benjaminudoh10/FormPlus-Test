from flask import Flask, render_template
from flask_cache import Cache

import requests
import json

app = Flask(__name__)


@app.route('/')
def index():
    cities = ['Ajah', 'Victoria Island', 'Apapa', 'Epe', 'Maryland']
    result = []
    payload = {'units': 'metric',
               'appid': 'bdb6a33c9329487e20d44d3bccce25fb'}
    url = 'http://api.openweathermap.org/data/2.5/weather'
    for city in cities:
        data = requests.get(url + '?units=metric&APPID=bdb6a33c9329487e20d44d3bccce25fb&q=' + city).content
        data = json.loads(data)
        result.append(data)
    return render_template('index.html', result=result)


@app.route('/api/<latitude>/<longitude>/')
def api(latitude, longitude):
    payload = {'lat': latitude,
               'lon': longitude,
               'units': 'metric',
               'appid': 'bdb6a33c9329487e20d44d3bccce25fb'}
    url = 'http://api.openweathermap.org/data/2.5/weather'
    try:
        data = requests.get(url, params=payload).content
    except:
        return json.dumps({'error': 'An error occurred.'})
    return data


@app.route('/api/<name>/')
def api_name(name):
    if not name:
        return json.dumps({'error': 'Name parameter not specified.'})
    payload = {'appid': 'bdb6a33c9329487e20d44d3bccce25fb',
               'units': 'metric',
               'q': name}
    url = 'http://api.openweathermap.org/data/2.5/weather'
    try:
        data = requests.get(url, params=payload).content
    except:
        return json.dumps({'error': 'An error occurred.'})
    return data


if __name__ == '__main__':
    app.run(debug=True)
