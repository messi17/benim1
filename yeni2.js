gconst urlField = document.getElementById('custom-url');
const loadButton = document.getElementById('load-it');
const loadSelect = document.getElementById('load-m3u8');

loadButton.addEventListener('click', e => {
  const file = urlField.value;
  e.preventDefault();
  if (file) {
    playerInstance.load({ file });
  }
}, false);

loadSelect.addEventListener('change', function() {
  urlField.value = this.value;
  urlField.disabled = !!this.value;
}, false);

const playerInstance = jwplayer('player').setup({
  file: [...loadSelect.querySelectorAll('option')].find(o => !!o.value).value
});

loadSelect.dispatchEvent(new Event('change'));
