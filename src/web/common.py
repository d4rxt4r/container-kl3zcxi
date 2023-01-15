
from urllib.request import Request, urlopen
from flask import send_file
import pathlib

HEADERS = {'User-Agent': 'Mozilla/5.0'}


def get_page_contents(url):
    req = Request(
        url=url,
        headers=HEADERS
    )
    return urlopen(req).read()


def proxy_image(url):
    file_extension = pathlib.Path(url).suffix
    mimetype = 'image/' + file_extension[1:]

    req = Request(
        url=url,
        headers=HEADERS
    )
    return send_file(urlopen(req), mimetype=mimetype)
