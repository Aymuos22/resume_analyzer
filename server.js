const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/analyze-resume', async (req, res) => {
    const { resumeText } = req.body;
    
    try {
        const response = await fetch('https://api.openai.com/v1/classifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': '' 
            },
            body: JSON.stringify({
                model: 'text-davinci-002',
                query: 'Advantages and disadvantages of this resume: ' + resumeText,
                examples: ['Advantages', 'Disadvantages'],
                labels: ['Positive', 'Negative']
            })
        });

        if (!response.ok) {
            throw new Error('Failed to analyze resume with OpenAI uuuuu.');
        }

        // Read the response body as text and then parse it as JSON
        const responseBody = await response.text();
        const result = JSON.parse(responseBody);
        console.log("result is");
        console.log(result);

        res.json(result);
    } catch (error) {
        console.error('Error analyzing resume:', error);
        let errorMessage = '';
        if (error.message.includes('API key')) {
            errorMessage = 'Invalid or missing API key. Please ensure that you have provided a valid API key for the OpenAI API and that it has the necessary permissions to access the classification endpoint.';
        } else if (error.message.includes('format')) {
            errorMessage = 'Failed to format request to OpenAI API. Please ensure that the request body sent to the OpenAI API is correctly formatted according to their documentation.';
        } else if (error.message.includes('parse')) {
            errorMessage = 'Failed to parse response from OpenAI API. The response from the API could not be parsed as JSON or does not match the expected structure. Please verify that the API response is valid JSON and is structured as expected.';
        } else if (error.message.includes('connect')) {
            errorMessage = 'Unable to connect to OpenAI API. There might be network issues preventing the connection to the OpenAI API endpoint. Please ensure that your server can reach the OpenAI API endpoint and that there are no network restrictions preventing the connection.';
        } else {
            errorMessage = 'Failed to analyze resume';
        }
        res.status(500).json({ error: errorMessage });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
