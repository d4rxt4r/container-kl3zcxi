from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

from urllib.request import Request, urlopen
from urllib.parse import urlencode

from datetime import datetime

from bs4 import BeautifulSoup

import json

from common import get_page_contents


def get_gwt_token(username, password):
    chrome_options = Options()
    chrome_options.add_argument("headless")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")

    driver = webdriver.Chrome(
        chrome_options=chrome_options, executable_path='/usr/bin/chromedriver')

    url = "https://grouple.co/internal/auth/login"
    driver.get(url)

    driver.find_element(By.XPATH, '//*[@id="username"]').send_keys(username)
    driver.find_element(By.XPATH, '//*[@id="password"]').send_keys(password)

    driver.find_element(
        By.XPATH, '//input[@class="btn btn-success btn-block btn-lg" and @type="submit"]').submit()

    local_storage = driver.execute_script("return window.localStorage;")

    return local_storage["gwt"][1:-1] or None


def __extract_tile_data(soup):
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


def __add_bookmarks_data(items, site_id, auth_token):

    def __find_item_by_id(items, id):
        for x in items:
            if x['data_id'] == id:
                return x
        else:
            return None

    bookmark_api = 'https://api.rmr.rocks/api/bookmark/getAll'

    post_dict = {
        "siteId": str(site_id + 1),
        "type": "MANGA",
        "itemMarker":  datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "externalIds": ','.join([item['data_id'] for item in items]),
        "includeUpdates": "true"
    }

    req = Request(
        url=bookmark_api,
        headers={'User-Agent': 'Mozilla/5.0',
                 'Content-Type': 'application/x-www-form-urlencoded',
                 'authorization': 'Bearer ' + auth_token},
        data=urlencode(post_dict).encode("utf-8")
    )

    bookmark_data = json.loads(urlopen(req).read())

    for bookmark in bookmark_data:
        id = bookmark['element']['elementId']['externalId']
        tile_item = __find_item_by_id(items, str(id))
        if tile_item:
            tile_item['status'] = bookmark['status']

    print(items)

def extract_grouple_links(url, site_id, auth_token):
    page = get_page_contents(url)
    soup = BeautifulSoup(page, 'html.parser')

    tiles_data = __extract_tile_data(soup)

    if auth_token:
        __add_bookmarks_data(tiles_data, site_id, auth_token)

    return tiles_data
