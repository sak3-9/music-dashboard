const Parser = require('rss-parser');

exports.handler = async function(event) {
  const rssUrl = event.queryStringParameters.url;

  if (!rssUrl) {
    return { statusCode: 400, body: JSON.stringify({ error: 'URLが指定されていません' }) };
  }

  // ★★★ これが最後の切り札です ★★★
  // 「私は一般的なブラウザです」と名乗るための身分証明書
  const customHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml,application/xml;q=0.9,*/*;q=0.8'
  };

  try {
    const parser = new Parser({
      // パーサーに身分証明書を渡す
      headers: customHeaders,
    });
    
    // URLから直接RSSを解析する
    const feed = await parser.parseURL(rssUrl);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feed),
    };

  } catch (error) {
    console.error(`RSS取得エラー (${rssUrl}):`, error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `RSSフィードの取得または解析に失敗しました。` }),
    };
  }
};