import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const doi = event.queryStringParameters?.doi;

  if (!doi) {
    return { statusCode: 400, body: JSON.stringify({ error: 'DOI is required' }) };
  }

  try {
    // Fetch from Crossref API
    const response = await fetch(`https://api.crossref.org/works/${doi}`);
    
    if (!response.ok) {
      return { 
        statusCode: response.status, 
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: `Crossref returned ${response.status}`, doi }) 
      };
    }

    const data: any = await response.json();
    const item = data.message;

    const result = {
      title: item.title?.[0] || 'Unknown Title',
      journal: item['container-title']?.[0] || 'Unknown Journal',
      year: item.issued?.['date-parts']?.[0]?.[0] || new Date().getFullYear(),
      authors: item.author?.map((a: any) => `${a.given} ${a.family}`) || [],
      indexing: item.source === 'Crossref' ? 'Scopus/WoS' : 'Other',
      doi: item.DOI
    };

    return {
      statusCode: 200,
      headers: { 
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(result),
    };
  } catch (err: any) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message || 'Failed to fetch DOI metadata' }),
    };
  }
};
