from urllib.request import Request, urlopen
from urllib.parse import urlencode
from datetime import datetime
import json


def extract_shakai_links(url, offset):
    post_dict = {
        "dataRun": "catalog",
        "selectCatalog": "manga",
        "itemMarker":  datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "selectPage": offset,
        "dataSorting":  "false,po-rejtingu,false,false,false,false,false",
        "dataType": "false,false,false,false,false,false,false,false",
        "dataStatus": "false,zavershen,false,est",
        "dataGenre": "false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false",
        "dataSeason": "false, false, false, false, false, false"
    }

    req = Request(
        url=url,
        headers={'User-Agent': 'Mozilla/5.0',
                 'Content-Type': 'application/x-www-form-urlencoded'},
        data=urlencode(post_dict).encode("utf-8")
    )

    json_data = json.loads(urlopen(req).read())

    result = []
    for item in json_data['result']:
        record = {}

        record['data_id'] = item['output-id']
        record['title'] = item['output-name']
        record['href'] = 'https:' + item['output-link']
        record['img'] = 'https:' + item['output-cover']

        record['yaoi'] = False

        tags_data = []
        tags = item['output-genre'].split(', ')
        for tag in tags:
            tags_data.append(tag)
            if (tag == 'Яой'):
                record['yaoi'] = True

        record['tags'] = tags_data
        record['single'] = False

        result.append(record)

    return result
