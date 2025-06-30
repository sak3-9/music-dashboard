const Parser = require('rss-parser');

exports.handler = async function(event) {
  const rssUrl = event.queryStringParameters.url;

  if (!rssUrl) {
    return { statusCode: 400, body: JSON.stringify({ error: 'URLが指定されていません' }) };
  }

  try {
    const parser = new Parser();
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