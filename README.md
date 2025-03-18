```
npm install
npm run dev
open http://localhost:3000
(voir swagger)
```
.env
```
apiKey = AIzaSyBKg5RYYAZ98LHku8aGSi0IRu05ElyT5n0
authDomain = hackaton-f06d6.firebaseapp.com
databaseURL = https://hackaton-f06d6-default-rtdb.europe-west1.firebasedatabase.app
projectId = hackaton-f06d6
storageBucket = hackaton-f06d6.firebasestorage.app
messagingSenderId = 369433667430
appId = 1:369433667430:web:0d2edbc690a0fc1d3bcaa7
measurementId = G-N3M9SBQ1ZS
client_email = firebase-adminsdk-fbsvc@hackaton-f06d6.iam.gserviceaccount.com
private_key = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCjQVUb63u8L/MK\noG/Hs0qxf8KcdYbstS1wjjOTr2ai3vWcA1/akh7DhQg5YWXY9QlaY+EAG41O1Ujg\nzWKzx0TuWzP7hax6ux39ZgMIpTDTx6n2PiyJk8GPGd/DsT33I1iqbIBHNnXzJFVd\nGewHRJvYySmfpJ/7BuDunw6/p8EdBU+FJPsCLSRkmx4oUyPZaTszUrreHLWULp+3\n157PB874JJGgXcHtUhq1e8ozkzY8SYN/3I1LW0I6/x4uWjwtHSRSbiRba1tLjvdV\noBydXKwVmIq8K7icTeXYD+f0nJCSAfPCcwgeIuMN4TpddKTkAJ5V87kNYIm2F3yB\nAi94lv2DAgMBAAECggEAPvIw06wPMHc4ea90igZKVXgSXGtAU8Jju9NIdbgalc/r\n2XS/n7HZZL/FdQJl16pbKdv65CS7blr0V6E5XmIF5PWLbH6VC1lcbdjIcKvo0K9a\njBRa7cznw7pROc38O28If+WH7G1GOzKWK2iURhUhFgwyHVjHSm3Tio4PjLwszHgi\nggwUTI6xDJf2YfMBaU61nVgyRSGkKgTk5qNEK60Mmh2O8BEQXZ3fouXGtHMSZQ9a\nHvb1mYVM7zSs1KBsPufe+oul2/QY9kU9HANcKucVOAxJktBtDIYpC9c5tlwNXUKT\nJVbogi1iyfGnBaCZonSO7uTpRN8+1WgzB/RFlEVZoQKBgQDekUzgEel2+PDge3/H\nzwiDsJcv89ND4Dsnph9liYlxE3+otAbioOz4tC7Tqbb8pqyzWsgap1MU5ai9VySM\najBAlN2PgW5amz0fU4er9u/4zdtC5m5Rsk2mf3tZ2792YoerZMDSi+nlGMa3dDZ6\nMwOjVmjFE4XPq3LHAay27MaNUwKBgQC7xzYREILrRwqWPbmp53cWPCGyg48+Yf2h\nlzv4FEE5MnA9AQwM7n+koFKW+xDyvLC6kAgsaGl9ovcLmG9+y4Z/MkHeo7omLgh7\nPwyDl6atweyTbmyMRxUXW+aHiVSHebVC3aE2BB3FOHXFjMf3QXl0vNy39lLXvTEP\nLOUaSCuZEQKBgEAFw/tgq6vRiFjKrcMoRua60YK1vLv1sI6DNtzaZ3LjjQFWZ/Sh\nHgmcqyuv0jdzKpKdNpqUL03/kj6E5rqNgTvSlrlFHh1qMnbkbE6HRhhn/v6Lkohl\npfiTC0SZ9cV0KlqfLOhj3vBL5D25bEJSkmVV4eVu7DsEsouUa75i9eqJAoGAOku8\nU0vm+RgTB1WeYEsFw5djdsI1JE7TqOkEqx3Oqe0ovyemEBWy9u729Px45IMD8sdo\nYjEAHwsK20S1yI1y8eYuYOo/jj7YTzrhrbDVBDiiM5sig+JFf/z98rIF1hFI3rtj\noxtgCqxek7gDFJX1GPLRKyOD0Iphwq5Tafdh4aECgYEAs4DH2z6ycqJMqNiWfJIF\nEHCFyH8jrxTW28nbGmsavvIIO111Dgsu14LO25z7FKJQu7FZsbOIKGGkU1G4gTDJ\nzy1wp2eZrhtWZtr7ZabxfVdB4spTkvle/1OAUjOoKmt0H38FWCaZKLSi6I5ZJDjC\nVEhj0JcAtAcGGAfLIPOOlgY=\n-----END PRIVATE KEY-----\n"
connexion_string_iot = "HostName=iot-hackaton-ynov.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=sdXCmOEjczXy55vbpb4T0scMo0dmyC0eoAIoTG7/ugQ="
```
**Architecture:**
```mermaid
graph TD;
    subgraph Frontend
        WebApp[Web App]
        MobileApp[Mobile App]
    end

    subgraph Backend
        API[API] -->|Auth| Firebase
        API -->|IoT Gestion| AzureIoT[Azure IoT Hub]
    end

    subgraph IoT Infrastructure
        AzureIoT -.->|Messages| DeviceSimulator[Simulateur de Devices]
    end

    DeviceSimulator[Simulateur de Devices] -.->|Messages| AzureIoT
    WebApp -->|API Requests| API
    MobileApp -->|API Requests| API
    Firebase[(Firebase Auth)] -.-> API
```

La gestion des devices ce fait par Azure IoT Hub ou par nôtre api qui integre le sdk azure.

<img width="1457" alt="image" src="https://github.com/user-attachments/assets/01282aca-2f9d-43d0-88ea-7a5e5e6fd74f" />

Il est possible d'utilisé Azure IoT Hub Device Provisioning Service (DPS) pour connecter un device fictif tournant en local sur une machine:

documentation: https://learn.microsoft.com/en-gb/azure/iot-dps/quick-create-simulated-device-symm-key?pivots=programming-language-nodejs

- `global_service_enpoint: 'global.azure-devices-provisioning.net'`
- `id_scope: '0ne00EE5AAF'`
- `primary_key: '/fH4gcGeQmt4qu3cfpS5gdLCPsOPVQ1qrVpQEXjInyX6AJDIp1BIY28t+2QjQnfFgydxoEDWRh1qAIoTBV3eMA=='`
- `registration_id: 'lampe'`

<img width="1457" alt="image" src="https://github.com/user-attachments/assets/3d8ccd1a-c2de-46c2-910c-eeaf3699fa90" />




