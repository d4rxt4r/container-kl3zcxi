const baseUrls = ['https://readmanga.live', 'https://mintmanga.live', 'https://shakai.ru/catalog/manga/'];

const SITE_ID = {
   READ: 1,
   MINT: 2,
   SHAKAI: 3
};

const BOOKMARK_STATUS = {
   COMPLETED: '#22903b',
   DROPPED: '#707070',
   PLANED: '#c40af8',
   WATCHING: '#429cc7',
   FAVORITE: '#FFD050',
   USER_DEFINED: '#4200FF',
   ON_HOLD: '#dc3545'
};

async function __get_gwt(siteId, username, password) {
   if (!username && !password) {
      return;
   }

   const res = await fetch(`/login/${siteId}/?username=${username}&password=${password}`);
   return await res.json();
}

function __set_status(status) {
   const statusDiv = document.getElementById('status');
   const avatar = statusDiv.querySelector('.avatar');
   const statusText = statusDiv.querySelector('.status-text');

   if (status) {
      avatar.classList.add('bg-green');
      avatar.classList.remove('bg-red');

      statusText.innerText = 'connected';
   } else {
      avatar.classList.add('bg-red');
      avatar.classList.remove('bg-green');

      statusText.innerText = 'not connected';
   }
}

function __createTile(tile, siteId) {
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

   if (tile.status) {
      const statusTpl = tileTpl.querySelector('.card-status');
      statusTpl.innerHTML = '❤';
      statusTpl.style = `color: ${BOOKMARK_STATUS[tile.status]}`;
   }

   return tileTpl;
}

async function __queryData(siteId, offset) {
   const token = siteId === 2 ? null : window.gwt || null;

   const res = await fetch(`/query/${siteId - 1}/${offset}`, {
      headers: {
         'x-token': token
      }
   });
   return await res.json();
}

function __renderData(data, siteId, resultsDiv) {
   if (!data.length) {
      const emptyResults = document.getElementById('noResults').content.cloneNode(true);
      resultsDiv.append(emptyResults);
      return;
   }

   for (const tile of data) {
      const tileTpl = __createTile(tile, siteId);
      resultsDiv.append(tileTpl);
   }
}

function __login() {
   const gwt_cookie = Cookies.get('gwt');

   if (gwt_cookie) {
      window.gwt = gwt_cookie;
      __set_status(true);
   }
}

async function init(siteId, offset = 0) {
   const resultsDiv = document.querySelector('.columns');
   resultsDiv.innerHTML = null;

   __login();

   const data = await __queryData(siteId, offset);
   __renderData(data, +siteId, resultsDiv);
}

async function login() {
   const siteId = parseInt(siteSelect.value);
   const username = document.getElementById('username').value;
   const password = document.getElementById('password').value;

   if (siteId === SITE_ID.SHAKAI) {
      return;
   }

   const res = await __get_gwt(siteId, username, password);

   if (!res.success) {
      __set_status(false);
      return;
   }

   Cookies.set('gwt', res.token, { expires: 365 });
   Cookies.set('grouple_username', username, { expires: 365 });
   Cookies.set('grouple_password', password, { expires: 365 });

   __set_status(true);
}

const loadBtn = document.getElementById('load');
const siteSelect = document.getElementById('siteSelect');
const pageInput = document.getElementById('pageInput');

const siteIdCookie = Cookies.get('siteId');
const pageNumCookie = Cookies.get('pageNum');

if (siteIdCookie && pageNumCookie) {
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

document.getElementById('settings').addEventListener('click', () => {
   document.querySelector('.settings').classList.toggle('visible');
});
