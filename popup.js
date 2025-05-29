document.getElementById('reset-call-counts-btn').addEventListener('click', () => {
  let count = 0;
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.startsWith('callCount_')) {
      localStorage.removeItem(key);
      count++;
    }
  }
  const status = document.getElementById('status');
  if (count > 0) {
    status.textContent = `✅ Reset ${count} call count${count > 1 ? 's' : ''}!`;
  } else {
    status.textContent = 'No call counts found to reset.';
  }
  setTimeout(() => { status.textContent = ''; }, 3000);
});