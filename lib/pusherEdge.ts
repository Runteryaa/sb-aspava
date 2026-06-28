export async function triggerPusherEdge(channel: string, event: string, data: any) {
  const appId = process.env.PUSHER_APP_ID || "2171468";
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY || "3e97c3f16351fdefca9e";
  const secret = process.env.PUSHER_SECRET || "6a4c9dbea9006d6f755b";
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu";

  try {
    const body = JSON.stringify({
      name: event,
      channels: [channel],
      data: JSON.stringify(data)
    });

    const url = `https://api-${cluster}.pusher.com/apps/${appId}/events`;
    
    // Create MD5 of body
    const bodyBuffer = new TextEncoder().encode(body);
    const hashBuffer = await crypto.subtle.digest('MD5', bodyBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const bodyMd5 = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const timestamp = Math.floor(Date.now() / 1000);
    const params = [
      `auth_key=${key}`,
      `auth_timestamp=${timestamp}`,
      `auth_version=1.0`,
      `body_md5=${bodyMd5}`
    ].join('&');

    const stringToSign = `POST\n/apps/${appId}/events\n${params}`;

    const secretBuffer = new TextEncoder().encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      secretBuffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      new TextEncoder().encode(stringToSign)
    );
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const signature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const finalUrl = `${url}?${params}&auth_signature=${signature}`;

    const res = await fetch(finalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body
    });
    
    if (!res.ok) {
        console.error('Pusher REST API failed:', await res.text());
    }
    return res;
  } catch (error) {
    console.error('Pusher Edge trigger error:', error);
  }
}
