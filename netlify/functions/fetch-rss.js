const fetch = require('node-fetch');
const iconv = require('iconv-lite');
const Parser = require('rss-parser');

exports.handler = async function(event) {
  const rssUrl = event.queryStringParameters.url;

  if (!rssUrl) {
    return { statusCode: 400, body: JSON.stringify({ error: 'URLが指定されていません' }) };
  }

  try {
    // タイムアウトを8秒に設定
    const response = await fetch(rssUrl, { timeout: 8000 });

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS. Status: ${response.status}`);
    }

    // レスポンスをBufferとして取得
    const buffer = await response.buffer();

    const contentType = response.headers.get('content-type') || '';
    const charset = contentType.toLowerCase().includes('shift_jis') ? 'shift_jis' : 'utf-8';
    const xmlData = iconv.decode(buffer, charset);

    const parser = new Parser();
    const feed = await parser.parseString(xmlData);

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