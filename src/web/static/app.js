const baseUrls = ['https://readmanga.live', 'https://mintmanga.live', 'https://shakai.ru/catalog/manga/'];
// const userID = 582791;

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

function createLink(tile, siteId, grouple = true) {
   const linkWrap = document.createElement('div');
   const link = document.createElement('a');

   linkWrap.classList.add('link-wrap');

   link.innerText = tile.title;
   if (tile.single) {
      link.innerText += ' (Сингл)';
   }

   link.target = '_blank';
   link.href = baseUrls[siteId - 1] + tile.href;
   link.dataset['id'] = tile['data_id'];

   linkWrap.append(link);

   if (tile.yaoi) {
      const chip = document.createElement('div');
      chip.classList.add('chip', 'bg-error');
      chip.innerText = 'yaoi';
      linkWrap.append(chip);
   }

   // if (grouple) {
   //    const refreshStatus = document.createElement('span');
   //    refreshStatus.innerHTML = '<i class="icon icon-refresh"></i>';
   //    refreshStatus.setAttribute('onclick', `getStatus(${tile['data_id']}, ${siteId})`);
   //    linkWrap.append(refreshStatus);
   // }

   return linkWrap;
}

// TODO: rewrite shakai module
async function getShakaiManga(url, resultsDiv) {
   await fetch(url)
      .then((response) => {
         return response.text();
      })
      .then((data) => {
         console.log(data);
      });

   // shakai
   // if (siteId == 3) {
   //    const url = proxyUrl + encodeURIComponent(baseUrls[2] + offset);
   //    getShakaiManga(url, resultsDiv);
   //    // await fetch(url)
   //    //     .then(response => { return response.text() })
   //    //     .then(data => {
   //    //         const parser = new DOMParser();
   //    //         const parsed_document = parser.parseFromString(data, 'text/html');

   //    //         const posters = parsed_document.querySelectorAll('.poster');

   //    //         if (posters.length == 0) {
   //    //             const emptyResults = document.getElementById('noResults').content.cloneNode(true);
   //    //             resultsDiv.append(emptyResults);
   //    //         } else {
   //    //             for (let i = 0; i < posters.length; i++) {
   //    //                 const description = posters[i].querySelectorAll('.poster__float-description');
   //    //                 const release = description[1].innerText;
   //    //                 const genres = description[2].innerText
   //    //                 if (!release.includes('Завершен') && genres.includes('Яой')) continue;
   //    //                 const linkWrap = document.createElement('div');
   //    //                 const link = document.createElement('a');
   //    //                 link.innerText = posters[i].querySelector('.poster__float-heading').innerText.match(/[^/]+$/gm)[0];
   //    //                 link.href = posters[i].href;
   //    //                 link.target = '_blank';
   //    //                 linkWrap.append(link);

   //    //                 linkWrap.style = 'display: block; font-size: 1.5em; padding: .5em';
   //    //                 resultsDiv.append(linkWrap);
   //    //             }
   //    //         }
   //    //     });
   // }
}

async function _queryData(siteId, offset) {
   if (siteId === 3) {
      return null;
   }

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
      const link = createLink(tile, siteId, true);
      resultsDiv.append(link);
   }
}

async function getTitlesFromPage(siteId, offset = 0) {
   if (document.querySelector('.results')) document.querySelector('.results').remove();

   const resultsDiv = document.createElement('div');
   resultsDiv.classList.add('results');
   document.body.append(resultsDiv);

   const data = await _queryData(siteId, offset);
   _renderData(data, siteId, resultsDiv);
}

const loadBtn = document.getElementById('load');
const siteSelect = document.getElementById('siteSelect');
const pageInput = document.getElementById('pageInput');

const siteIdCookie = Cookies.get('siteId');
const pageNumCookie = Cookies.get('pageNum');

if (siteIdCookie != undefined && pageNumCookie != undefined) {
   siteSelect.value = siteIdCookie;
   pageInput.value = pageNumCookie;
   getTitlesFromPage(siteSelect.value, pageInput.value);
} else {
   getTitlesFromPage(1, 0);
}

loadBtn.addEventListener('click', () => {
   Cookies.set('siteId', siteSelect.value, { expires: 365 });
   Cookies.set('pageNum', pageInput.value, { expires: 365 });
   getTitlesFromPage(siteSelect.value, pageInput.value);
});
