from flask import Flask, render_template, request, jsonify
from logger import log
from urllib.request import Request, urlopen
from bs4 import BeautifulSoup
from enum import Enum

BASE_URLS = ['https://readmanga.live', 'https://mintmanga.live']
HEADERS = {'User-Agent': 'Mozilla/5.0'}


def __get_page_contents(url):
    req = Request(
        url=url,
        headers={'User-Agent': 'Mozilla/5.0'}
    )
    return urlopen(req).read()


def __extract_grouple_links(soup):
    tiles = soup.find_all(class_='tile')

    if not len(tiles):
        return None

    tiles_data = []

    for tile in tiles:
        tile_data = {}
        tile_data['data_id'] = tile.find(
            'div', class_='bookmark-body').attrs['data-id']

        header = tile.find('h3').find('a')
        tile_data['title'] = header.attrs['title']
        tile_data['href'] = header.attrs['href']

        tile_data['yaoi'] = False
        tags = tile.find_all('a', class_='element-link')
        for tag in tags:
            if (tag.string == 'яой'):
                tile_data['yaoi'] = True

        tile_data['single'] = True if len(
            tile.find('span', class_='mangaSingle') or []) else False

        tiles_data.append(tile_data)

    return tiles_data


def __extract_links(site_id, soup):
    if site_id in (0, 1):
        return __extract_grouple_links(soup)
    return


def __get_links(site_id=0, offset=None):
    url = BASE_URLS[site_id]
    if site_id in (0, 1):
        url = url + '/list?sortType=votes&filter=translated'
        if offset:
            url = url + '&' + str(offset)

    page = __get_page_contents(url)
    soup = BeautifulSoup(page, 'html.parser')

    return __extract_links(site_id, soup)


app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/query/<site_id>/<offset>")
def query(site_id, offset):
    return __get_links(int(site_id), int(offset))


@app.route("/test")
def test():
    return __get_links()
