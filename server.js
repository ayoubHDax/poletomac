const express = require('express'); // استيراد مكتبة Express
const axios = require('axios'); // استيراد مكتبة Axios للتعامل مع الطلبات HTTP
const app = express(); // إنشاء تطبيق Express

// إعداد المتغيرات
const CLIENT_ID = '1296056932657926144'; // معرف العميل من تطبيق Discord
const CLIENT_SECRET = 'EYxPGNjNijryCt0VDMUpXhh0XwJouePd'; // السر الخاص بالعميل
const REDIRECT_URI = 'https://discord.com/oauth2/authorize?client_id=1296056932657926144&response_type=code&redirect_uri=https%3A%2F%2Fayoubhdax.github.io%2Fpoletomac%2Findex.html&scope=identify+guilds+email+guilds.join+connections'; // URI لإعادة التوجيه بعد تسجيل الدخول

// نقطة النهاية لتسجيل الدخول عبر Discord
app.get('/auth/discord/callback', async (req, res) => {
    const { code } = req.query; // الحصول على الرمز من الاستعلام

    // تبادل الرمز للحصول على رمز الوصول
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'scope': 'identify guilds'
    }));

    // الحصول على بيانات المستخدم
    const userData = await axios.get('https://discord.com/api/v10/users/@me', {
        headers: {
            'Authorization': `${tokenResponse.data.token_type} ${tokenResponse.data.access_token}`
        }
    });

    // الحصول على الخوادم التي ينتمي إليها المستخدم
    const guildsResponse = await axios.get('https://discord.com/api/v10/users/@me/guilds', {
        headers: {
            'Authorization': `${tokenResponse.data.token_type} ${tokenResponse.data.access_token}`
        }
    });

    // التحقق مما إذا كان المستخدم في الخادم المحدد ولديه رتبة "ورشة التصنيع"
    const userGuilds = guildsResponse.data;
    const workshopRole = '1071933355538530337'; // استبدل بـ ID الرتبة الخاصة بك
    let isWorkshop = false;

    userGuilds.forEach(guild => {
        if (guild.id === '1071933157097615480') { // استبدل بـ ID الخادم الخاص بك
            if (guild.roles && guild.roles.includes(workshopRole)) {
                isWorkshop = true;
            }
        }
    });

    // إعادة توجيه المستخدم بناءً على رتبته
    if (isWorkshop) {
        res.redirect('/workshop-dashboard'); // إعادة توجيه إلى لوحة تحكم ورشة التصنيع
    } else {
        res.redirect('/user-dashboard'); // إعادة توجيه إلى لوحة تحكم المستخدم العادي
    }
});

// بدء الخادم
app.listen(3000, () => {
    console.log('Server is running on port 3000'); // طباعة رسالة عند بدء الخادم
});
