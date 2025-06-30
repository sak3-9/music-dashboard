document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refresh-btn');
    
    const newsSources = [
        { id: 'column-natalie', rssUrl: 'https://natalie.mu/music/feed/news' },
        { id: 'column-barks', rssUrl: 'https://www.barks.jp/rss/news.xml' },
        { id: 'column-billboard', rssUrl: 'https://www.billboard-japan.com/rss/news.xml' }
    ];

    // Netlifyのサーバーレス関数のエンドポイント
    const API_ENDPOINT = '/.netlify/functions/fetch-rss';

    async function fetchAndDisplayNews(source) {
        const column = document.getElementById(source.id);
        const articlesContainer = column.querySelector('.articles');
        const loadingIndicator = column.querySelector('.loading');

        articlesContainer.innerHTML = '';
        loadingIndicator.style.display = 'block';

        try {
            // 自作APIに、取得したいRSSのURLをパラメータとして渡す
            const response = await fetch(`${API_ENDPOINT}?url=${encodeURIComponent(source.rssUrl)}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `サーバーエラーが発生しました (Status: ${response.status})`);
            }
            const data = await response.json();

            loadingIndicator.style.display = 'none';

            if (data.items && data.items.length > 0) {
                data.items.slice(0, 15).forEach(item => {
                    // rss-parserが生成する要約(contentSnippet)を利用する
                    const summary = item.contentSnippet || '';
                    const cleanSummary = summary.replace(/\n/g, ' ').slice(0, 150); // 整形

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