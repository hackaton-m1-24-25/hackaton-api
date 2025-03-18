import { createRoute, z } from "@hono/zod-openapi";
import { app } from "../../index.js";
import crypto from "crypto"
import { config } from 'dotenv';
config()

const route = createRoute({
    method: 'patch',
    path: 'api/devices/{id}',
    tags: ['Devices'],
    summary: 'Change le state de la lampe',
    request: {
        params: z.object({
            id: z.string().openapi({ example: "lampe" }),
        }),
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        led: z.boolean().openapi({ example: true }),
                    }),
                },
            },
            required: true,
        },
    },
    responses: {
        200: {
            description: 'State updated',
            content: {
                'application/json': {
                    schema: z.object({
                        message: z.string(),
                    }),
                },
            },
        },
        401: {
            description: 'Error while update state',
            content: {
                'application/json': {
                    schema: z.object({ error: z.string() }),
                },
            },
        },
    },
});

const handler = async (c: any) => {
    const { id } = c.req.valid('param');
    const { led } = c.req.valid('json');

    var generateSasToken = function(resourceUri: string | number | boolean, signingKey: WithImplicitCoercion<string> | { [Symbol.toPrimitive](hint: "string"): string; }, policyName: string, expiresInMins: number) {
            resourceUri = encodeURIComponent(resourceUri);
        
            // Set expiration in seconds
            var expires = (Date.now() / 1000) + expiresInMins * 60;
            expires = Math.ceil(expires);
            var toSign = resourceUri + '\n' + expires;
        
            // Use crypto
            var hmac = crypto.createHmac('sha256', Buffer.from(signingKey, 'base64'));
            hmac.update(toSign);
            var base64UriEncoded = encodeURIComponent(hmac.digest('base64'));
        
            // Construct authorization string
            var token = "SharedAccessSignature sr=" + resourceUri + "&sig="
            + base64UriEncoded + "&se=" + expires;
            if (policyName) token += "&skn="+policyName;
            return token;
        };
        
        const iotHubName = "iot-hackaton-ynov.azure-devices.net";
        const deviceId = id;
        const key = process.env.azure_iot_key || "";
        const expiryTime = 3600;
        const policyName = "iothubowner"
        const url = `https://${iotHubName}/twins/${deviceId}?api-version=2021-04-12`;
        const sasToken = generateSasToken(url, key, policyName, expiryTime);

    try {
        const response = await fetch(url,
            {
                method: "PATCH",
                headers: {
                    'Authorization': sasToken.trim()
                },
                body: JSON.stringify({
                    "properties": {
                        "desired": {
                            "led": led
                        }
                    }
                }),
            });
        const data = await response.json();
        console.log(data);

        if (data.error) {
            return c.json({ message: data.message }, data.code);
        }

        return c.json({ message: data }, 200);
    } catch (error) {
        console.error("Error while update state", error);
        return c.json({ message: `Error while update state:  ${error}` }, 404);
    }
}

export const patchDeviceRoute = () => app.openapi(route, handler)