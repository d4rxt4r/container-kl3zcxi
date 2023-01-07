from flask import Flask, render_template, send_file, request
from urllib.request import Request, urlopen
from bs4 import BeautifulSoup
import pathlib

BASE_URLS = ['https://readmanga.live', 'https://mintmanga.live']
HEADERS = {'User-Agent': 'Mozilla/5.0'}


def __get_page_contents(url):
    req = Request(
        url=url,
        headers=HEADERS
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
        tile_data['img'] = tile.find(
            'img', class_="img-fluid").attrs['data-original']

        tile_data['yaoi'] = False

        tags_data = []
        tags = tile.find_all('a', class_='element-link')
        for tag in tags:
            tags_data.append(tag.string)
            if (tag.string == 'яой'):
                tile_data['yaoi'] = True

        tile_data['tags'] = tags_data

        tile_data['single'] = True if len(
            tile.find('span', class_='mangaSingle') or []) else False

        tiles_data.append(tile_data)

    return tiles_data


def __extract_links(site_id, soup):
    if site_id in (0, 1):
        return __extract_grouple_links(soup)
    return


def __get_links(site_id=0, offset=1):
    url = BASE_URLS[site_id]
    if site_id in (0, 1):
        if site_id == 0:
            url = url + '/list?sortType=votes&filter=translated'
        else:
            url = url + '/list/another/noyaoi?sortType=votes&filter=translated'
        if offset:
            url = url + '&offset=' + str((offset-1)*70)

    page = __get_page_contents(url)
    soup = BeautifulSoup(page, 'html.parser')

    return __extract_links(site_id, soup)


def __load_image(url):
    file_extension = pathlib.Path(url).suffix
    mimetype = 'image/' + file_extension[1:]

    req = Request(
        url=url,
        headers=HEADERS
    )
    return send_file(urlopen(req), mimetype=mimetype)


app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/query/<site_id>/<offset>")
def query(site_id, offset):
    return __get_links(int(site_id), int(offset))


@app.route("/query/test")
def test():
    return __get_links()


@app.route("/image/")
def load_image():
    url = request.args.get('src')
    return __load_image(url)


@app.route("/image/test")
def image_test():
    url = 'https://staticrm.rmr.rocks/uploads/pics/00/80/809_p.jpg'
    return __load_image(url)
