const express = require('express');
const router = express.Router();
const axios = require('axios');




router.post('/message', async (req, res) => {

    try {

        const userMessage = req.body.message;
        const customPrompt = req.body.customPrompt || '';

        const botResponse = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                messages: [
                    { role: 'system', content: customPrompt},
                    { role: 'user', content: userMessage}
                ],
                model: 'llama3-70b-8192',
                stream: false
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
                }
            }
        );


        const botReply = botResponse.data.choices[0].message.content;
        res.json({ data: botReply});

    } catch (error) {
        console.error('GROQ api error: ', error.response?.data || error.message);
        res.status(500).json({ error: 'Bir hata oluştu', details: error.message});
    }

});

module.exports = router;