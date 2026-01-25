// Simple test function with no dependencies
export async function handler(event, context) {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      success: true,
      message: 'Test function working',
      timestamp: new Date().toISOString(),
      buildId: 'build-2026-01-25-v2'
    })
  };
}
