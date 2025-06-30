const axios = require('axios');
const iconv = require('iconv-lite');
const Parser = require('rss-parser');

exports.handler = async function(event) {
  const rssUrl = event.queryStringParameters.url;

  if (!rssUrl) {
    return { statusCode: 400, body: JSON.stringify({ error: 'URLが指定されていません' }) };
  }

  try {
    const response = await axios.get(rssUrl, {
      responseType: 'arraybuffer',
      timeout: 8000,
    });

    const contentType = response.headers['content-type'] || '';
    const charset = contentType.toLowerCase().includes('shift_jis') ? 'shift_jis' : 'utf-8';
    const xmlData = iconv.decode(response.data, charset);

    const parser = new Parser();
    const feed = await parser.parseString(xmlData);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feed),
    };

  } catch (error) {
    console.error(`RSS取得エラー (${rssUrl}):`, error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `RSSフィードの取得または解析に失敗しました。` }),
    };
  }
};