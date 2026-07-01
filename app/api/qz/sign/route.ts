export const runtime = 'edge';

const PRIVATE_KEY_PEM = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCcoPmJITNUBIMz
ShBsyCLWRzRIFMjAhDeg9/yI/M5Y/Igb7MbNTSheZDBj7x5YbxhkC7lBIL24xF45
E3xYqi7j6Wz7hG1bocrs4owk86pIOvWmiyURtlFfLAWtYLEQfLigZ/DnjQD8Zqar
Z++t/c4d3MveFBCANDKGHJTcNFSWXjxaylHellOMDCAq3W7SQk3BSOfw3IoDXm0B
Va0+PKbNrQ+7npNdQ6oHZPGYbBww1mkehKxBBnpZU4+GGkG8weDTanBLzwbPEfHa
EwAUdxXbL0+c16+EcsDpvDQHOHuxgHMRBPzF56iaZmlavzlvS3/owudhuj8z1ZjA
1sR8JeTlAgMBAAECggEAGzQ3Wxq13kohWotq4mX5bQO1gC6B9rQQMGhaB5X3JgwI
fOcpWVelIw3ePME3oU78asYBgV8VLK4Imnu4rXKzjbjJib7kupVVmEK56iIbKYv6
BhjlUZf7tp7ABq7EWjN7Yrri4+jA6tXObXdyMONkBRpIG3SbMBVA0DvPHBcHuQzz
2g0UUaqz7f7DW705fU00+phlkMY3SumZOpGMoVSxeI0tlJ9x8tS1o1EMeZpu8cX2
4I9QLHkemFWoD85D9WafWp037AFArKIAS+bWogzNBLJxKqfMxTxexfS++cECA9PG
hzl+6J557x9oqQo54TN8vYdipaR4b0N0k1ZnSDBUWQKBgQDUnO84yvd+59mIGoRB
73t8LbNwUKU6vCddl6hauzZqFNDJQysazdHNTq3g9qb7chY/jTt1UXAoaURxG0Ab
e7IvogHD2+QrRz7aMNGD24PbWdN9lbhDATK0Bwws0onCsQK26AKWNv3ZYUd8T09g
eIpl41slNl4cvtnG6dbGhTbELQKBgQC8l2Hg/HpA+kwC3S/cgtFh+qXad1+Jl6GS
Cw9s86L5xNx5hxYBfEvk1CM949TTMcGU3KnD6LoJ3ndRb+wEfh7LUM20SW7MN6M2
Yom9YQYBnGA51xtjeIk9IA02S2ox1vZO3ROOwFDI/yrLXeZQ+RuGUnnupJ/PuLtv
FxSfxJ7+mQKBgETZ2WIz4DgZjslThPbxPbT1+8DobMl7eugFH8DaFYH+4an7dW8F
reZlj0tltKeCx4+nBdU1HTQI+uAB6h28TfS86wNpJxeYx9LSslaX9LhI+4MUxAn2
zlucWKX/PBtvRSjEM2o/vq7xoLux10uvXWonWTHQzGNUrqOKwEGjjBu1AoGAFj0D
nbQn9mGNdQkAC9ChQBx+UjShX2gx9Ta4qvBP14QPO4ViYup1SJZ7UWD8R6smWJds
rV1UErXY/BFmk2EL4I22s/u0xQAKju8vrtUyEB6QekGTSTd9d2fAJxbdfuMKSGJp
W/vxisIMGc8IyaOWS1COcEWZUrVF5OOj2vMkjIECgYAiJAzvMn3asyQLn/TYQfHD
TlnVIUYLAP1jwpFhhBRpwGQQWM63IQ0C3SOwU+MaS8uyTsoKLuJgdrKJfvsIKugX
nGALsWwl2JkxfdWLif+EzT1MqHFRIAqjxgWBJI5upooQswnAShCFnjMu61iRh+J+
B33Mb7NFXwIV6bg+PJFJBA==
-----END PRIVATE KEY-----`;

function pemToArrayBuffer(pem: string) {
    const b64 = pem
        .replace(/-----BEGIN PRIVATE KEY-----/, '')
        .replace(/-----END PRIVATE KEY-----/, '')
        .replace(/\s+/g, '');
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

export async function POST(req: Request) {
    try {
        const { request } = await req.json();
        if (!request) {
            return new Response('Missing request parameter to sign', { status: 400 });
        }

        const keyBuffer = pemToArrayBuffer(PRIVATE_KEY_PEM);
        const cryptoKey = await crypto.subtle.importKey(
            'pkcs8',
            keyBuffer,
            {
                name: 'RSASSA-PKCS1-v1_5',
                hash: { name: 'SHA-512' },
            },
            false,
            ['sign']
        );

        const dataBuffer = new TextEncoder().encode(request);
        const signatureBuffer = await crypto.subtle.sign(
            'RSASSA-PKCS1-v1_5',
            cryptoKey,
            dataBuffer
        );

        const signatureBytes = new Uint8Array(signatureBuffer);
        let binary = '';
        for (let i = 0; i < signatureBytes.byteLength; i++) {
            binary += String.fromCharCode(signatureBytes[i]);
        }
        const signatureBase64 = btoa(binary);

        return new Response(signatureBase64, {
            status: 200,
            headers: { 'Content-Type': 'text/plain' }
        });
    } catch (e: any) {
        console.error('QZ sign error:', e);
        return new Response('Signing failed: ' + (e?.message || e?.toString()), { status: 500 });
    }
}
