document.addEventListener('DOMContentLoaded', function() {
  const addBookmarkBtn = document.getElementById('addBookmarkBtn');

  addBookmarkBtn.addEventListener('click', function() {
    const name = prompt('Enter bookmark name:');
    let url = prompt('Enter bookmark URL:');
  
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
  
    if (name && url) {
      getFaviconUrl(url)
        .then(iconUrl => {
          chrome.storage.sync.get({ bookmarks: [] }, function(data) {
            const bookmarks = data.bookmarks;
            const newBookmark = { name, url, iconUrl };
            bookmarks.push(newBookmark);
            chrome.storage.sync.set({ bookmarks }, function() {
              createBookmarks(bookmarks);
            });
          });
        })
        .catch(() => {
          console.log('Error fetching favicon');
          const tempFavicon = 'games-16.png'; // Temporary local favicon
          chrome.storage.sync.get({ bookmarks: [] }, function(data) {
            const bookmarks = data.bookmarks;
            const newBookmark = { name, url, iconUrl: tempFavicon }; // Use temp favicon
            bookmarks.push(newBookmark);
            chrome.storage.sync.set({ bookmarks }, function() {
              createBookmarks(bookmarks);
            });
          });
        });
    }
  });

  function getFaviconUrl(url) {
    return new Promise((resolve, reject) => {
      const faviconUrl = new URL(url).origin + '/favicon.ico';
      const img = new Image();
      img.onload = function() {
        resolve(faviconUrl);
      };
      img.onerror = function() {
        reject();
      };
      img.src = faviconUrl;
    });
  }
  
  function createBookmarks(bookmarks) {
    const bookmarkList = document.getElementById('bookmark-list');
    bookmarkList.innerHTML = '';
  
    const table = document.createElement('table');
    table.classList.add('bookmark-table');
  
    bookmarks.forEach((bookmark, index) => {
      const row = document.createElement('tr');
      row.classList.add('bookmark-row');
  
      const iconCell = document.createElement('td');
      const icon = document.createElement('img');
      icon.src = bookmark.iconUrl;
      icon.classList.add('bookmark-icon');
      iconCell.appendChild(icon);
  
      const linkCell = document.createElement('td');
      linkCell.classList.add('link-cell');
      const link = document.createElement('a');
      link.href = bookmark.url;
      link.textContent = bookmark.name;
      link.target = '_blank';
  
      link.addEventListener('click', function(event) {
        event.preventDefault();
        chrome.tabs.create({ url: bookmark.url });
      });
  
      linkCell.appendChild(link);
  
      const removeButtonCell = document.createElement('td');
      const removeButton = document.createElement('button');
      removeButton.textContent = '🗑';
      removeButton.classList.add('remove-btn');
      removeButton.dataset.index = index;
  
      removeButton.addEventListener('click', function() {
        const index = parseInt(this.dataset.index);
        if (!isNaN(index)) {
          chrome.storage.sync.get({ bookmarks: [] }, function(data) {
            const bookmarks = data.bookmarks;
            bookmarks.splice(index, 1);
            chrome.storage.sync.set({ bookmarks }, function() {
              createBookmarks(bookmarks);
            });
          });
        }
      });
  
      removeButtonCell.appendChild(removeButton);
  
      row.appendChild(iconCell);
      row.appendChild(linkCell);
      row.appendChild(removeButtonCell);
      table.appendChild(row);
    });
  
    bookmarkList.appendChild(table);
  }
  
  
  chrome.storage.sync.get({ bookmarks: [] }, function(data) {
    createBookmarks(data.bookmarks);
  });
});