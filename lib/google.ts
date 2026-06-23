import {google} from 'googleapis'

export const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/callback`
);

export const getGoogleAuthUrl = () =>{
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope:[
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile"
        ],
    })
}

export const getGoogleUser = async (code: string) =>{
    const {tokens} = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({version: 'v2', auth: oauth2Client});
    const {data } = await oauth2.userinfo.get();

    return data;
}