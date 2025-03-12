// public/script.js
const postsList = document.getElementById('postsList');
const postForm = document.getElementById('postForm');
const postText = document.getElementById('postText');

async function fetchPosts() {
  const res = await fetch('/api/posts');
  const data = await res.json();
  return data.posts;
}

function renderPosts(posts) {
  postsList.innerHTML = '';
  posts.forEach(post => {
    const li = document.createElement('li');
    li.textContent = post.text;
    
    // Update button
    const updateBtn = document.createElement('button');
    updateBtn.textContent = 'Update';
    updateBtn.onclick = async () => {
      const newText = prompt('Enter new text:', post.text);
      if (newText) {
        await fetch('/api/posts', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: post._id, text: newText })
        });
        loadPosts();
      }
    };

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = async () => {
      await fetch(`/api/posts?id=${post._id}`, {
        method: 'DELETE'
      });
      loadPosts();
    };

    li.appendChild(updateBtn);
    li.appendChild(deleteBtn);
    postsList.appendChild(li);
  });
}

async function loadPosts() {
  const posts = await fetchPosts();
  renderPosts(posts);
}

// Handle form submission for new posts
postForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = postText.value.trim();
  if (!text) return;
  
  await fetch('/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  });
  postText.value = '';
  loadPosts();
});

// Polling for live updates every 2 seconds
setInterval(loadPosts, 2000);

// Initial load
loadPosts();
