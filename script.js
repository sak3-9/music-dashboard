document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refresh-btn');
    
    // ★★ ニュースソースを新しいものに変更 ★★
    const newsSources = [
        { id: 'column-natalie', name: '音楽ナタリー', rssUrl: 'https://natalie.mu/music/feed/news' },
        { id: 'column-barks', name: 'rockin\'on.com', rssUrl: 'https://rockinon.com/rss/news' },
        { id: 'column-billboard', name: 'CINRA.NET', rssUrl: 'https://www.cinra.net/feed/category/music' }
    ];

    const API_ENDPOINT = '/.netlify/functions/fetch-rss';

    async function fetchAndDisplayNews(source) {
        const column = document.getElementById(source.id);
        // ★★ カラムのタイトルも動的に変更 ★★
        column.querySelector('h2').textContent = source.name;
        const articlesContainer = column.querySelector('.articles');
        const loadingIndicator = column.querySelector('.loading');

        articlesContainer.innerHTML = '';
        loadingIndicator.style.display = 'block';

        try {
            const response = await fetch(`${API_ENDPOINT}?url=${encodeURIComponent(source.rssUrl)}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `サーバーエラー (Status: ${response.status})`);
            }
            const data = await response.json();
            loadingIndicator.style.display = 'none';

            if (data.items && data.items.length > 0) {
                data.items.slice(0, 15).forEach(item => {
                    const summary = item.contentSnippet || '';
                    const cleanSummary = summary.replace(/\n/g, ' ').slice(0, 150);

                    const articleCard = `
                        <div class="article-card">
                            <h3><a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a></h3>
                            <p>${cleanSummary}${summary.length > 150 ? '...' : ''}</p>
                        </div>
                    `;
                    articlesContainer.innerHTML += articleCard;
                });
            } else {
                articlesContainer.innerHTML = `<p>ニュース記事が見つかりませんでした。</p>`;
            }
        } catch (error) {
            console.error(`Error fetching news for ${source.id}:`, error);
            loadingIndicator.style.display = 'none';
            articlesContainer.innerHTML = `<p>ニュースの取得に失敗しました。<br>${error.message}</p>`;
        }
    }
    
    function loadAllNews() {
        console.log('ニュースを更新中...');
        newsSources.forEach(source => fetchAndDisplayNews(source));
    }

    refreshBtn.addEventListener('click', loadAllNews);
    loadAllNews();
});