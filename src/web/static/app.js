const baseUrls = ['https://readmanga.live', 'https://mintmanga.live', 'https://shakai.ru/catalog/manga/'];
// const userID = 582791;

const SITE_ID = {
   READ: 1,
   MINT: 2,
   SHAKAI: 3
};

// TODO: fix read/mint manga status check
// function setStatus(data) {
//    const script = document.querySelector('.status-script');
//    const id = script.attributes.id;
//    const title = document.querySelector(`[data-id="${id}"]`);
//    if (title.children.length == 0) {
//       title.innerHTML += `<span> -- ${data.data.status}</span>`;
//    } else {
//       title.children[0].innerText = ` -- ${data.data.status}`;
//    }
//    script.remove();
// }

// function getStatus(id, siteId) {
//    const statusScript = document.createElement('script');
//    statusScript.attributes.id = id;
//    statusScript.classList.add('status-script');
//    statusScript.src = `https://grouple.co/external/status?callback=setStatus&id=${id}&site=${siteId}&user=${userID}`;
//    document.body.append(statusScript);
// }

function _createTile(tile, siteId, grouple = true) {
   const tileTpl = document.getElementById('tileTpl').content.cloneNode(true);

   tileTpl.querySelector('.img-responsive').src = siteId === SITE_ID.SHAKAI ? tile.img : `/image?src=${tile.img}`;

   const cardLink = tileTpl.querySelector('.card-link');
   cardLink.innerHTML = tile.title + (tile.single ? ' (Сингл)' : '');
   cardLink.href = siteId === SITE_ID.SHAKAI ? tile.href : baseUrls[siteId - 1] + tile.href;
   cardLink.target = '_blank';

   const tileFooter = tileTpl.querySelector('.card-subtitle');
   for (const tag of tile.tags) {
      const tagTpl = document.createElement('span');
      tagTpl.classList.add('chip');
      if (tile.yaoi && tag.toLowerCase() === 'яой') {
         tagTpl.classList.add('bg-error');
      }
      tagTpl.innerHTML = tag;

      tileFooter.append(tagTpl);
   }

   // if (grouple) {
   //    const refreshStatus = document.createElement('span');
   //    refreshStatus.innerHTML = '<i class="icon icon-refresh"></i>';
   //    refreshStatus.setAttribute('onclick', `getStatus(${tile['data_id']}, ${siteId})`);
   //    linkWrap.append(refreshStatus);
   // }

   return tileTpl;
}

async function _queryData(siteId, offset) {
   const res = await fetch(`/query/${siteId - 1}/${offset}`);
   return await res.json();
}

function _renderData(data, siteId, resultsDiv) {
   if (!data.length) {
      const emptyResults = document.getElementById('noResults').content.cloneNode(true);
      resultsDiv.append(emptyResults);
      return;
   }

   for (const tile of data) {
      const tileTpl = _createTile(tile, siteId, true);
      resultsDiv.append(tileTpl);
   }
}

async function init(siteId, offset = 0) {
   const resultsDiv = document.querySelector('.columns');
   resultsDiv.innerHTML = null;

   const data = await _queryData(siteId, offset);
   _renderData(data, +siteId, resultsDiv);
}

const loadBtn = document.getElementById('load');
const siteSelect = document.getElementById('siteSelect');
const pageInput = document.getElementById('pageInput');

const siteIdCookie = Cookies.get('siteId');
const pageNumCookie = Cookies.get('pageNum');

if (siteIdCookie != undefined && pageNumCookie != undefined) {
   siteSelect.value = siteIdCookie;
   pageInput.value = pageNumCookie;
   init(siteSelect.value, pageInput.value);
} else {
   init(1, 0);
}

loadBtn.addEventListener('click', () => {
   Cookies.set('siteId', siteSelect.value, { expires: 365 });
   Cookies.set('pageNum', pageInput.value, { expires: 365 });
   init(siteSelect.value, pageInput.value);
});
