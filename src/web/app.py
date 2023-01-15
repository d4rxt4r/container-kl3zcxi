from flask import Flask, render_template, request

from common import proxy_image
from grouple import get_gwt_token, extract_grouple_links
from shakai import extract_shakai_links

BASE_URLS = ['https://readmanga.live', 'https://mintmanga.live',
             'https://shakai.ru/take/catalog/request/shakai']
HEADERS = {'User-Agent': 'Mozilla/5.0'}


def __get_links(site_id=0, offset=1, auth_token=None):
    url = BASE_URLS[site_id]
    if site_id in (0, 1):
        if site_id == 0:
            url = url + '/list?sortType=votes&filter=translated'
        else:
            url = url + '/list/another/noyaoi?sortType=votes&filter=translated'
        if offset:
            url = url + '&offset=' + str((offset-1)*70)

    if site_id == 2:
        return extract_shakai_links(url, offset)

    return extract_grouple_links(url, site_id, auth_token)


app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/login/<site_id>/")
def login(site_id):
    username = request.args.get('username')
    password = request.args.get('password')
    token = None

    if username and password:
        if int(site_id) in (0, 1):
            token = get_gwt_token(username, password)

    return {
        'success': True if token else False,
        'token': token
    }


@app.route("/query/<site_id>/<offset>")
def query(site_id, offset):
    return __get_links(int(site_id), int(offset), request.headers.get('x-token'))


@app.route("/query/test")
def test():
    return __get_links()


@app.route("/image/")
def load_image():
    url = request.args.get('src')
    return proxy_image(url)


@app.route("/image/test")
def image_test():
    url = 'https://staticrm.rmr.rocks/uploads/pics/00/80/809_p.jpg'
    return proxy_image(url)
