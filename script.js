async function analyzeResume() {
    const fileInput = document.getElementById('pdf-file');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a PDF file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(event) {
        const typedarray = new Uint8Array(event.target.result);
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;

        let resumeText = '';
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();
            const textItems = content.items.map(item => item.str);
            resumeText += textItems.join(' ');
        }

        // Call server to analyze resume
        try {
            const insights = await analyzeWithServer(resumeText);
            // Display insights
            displayInsights(insights);
        } catch (error) {
            console.error('Error analyzing resume with server:', error);
            
            alert('Failed to analyze resume with server. Please try again later.');
        }
    };
    reader.readAsArrayBuffer(file);
}

async function analyzeWithServer(resumeText) {
   
    const response = await fetch('http://localhost:3000/analyze-resume', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resumeText })
    });
    if (!response.ok) {
        throw new Error('Failed to analyze resume with server.');
    }

    const result = await response.json();
    return result;
}

function displayInsights(insights) {
    const advantagesDiv = document.getElementById('advantages');
    const disadvantagesDiv = document.getElementById('disadvantages');

    advantagesDiv.innerHTML = `<h2>Advantages:</h2><ul>${insights.label === 'Positive' ? `<li>${insights.text}</li>` : '<li>No advantages found.</li>'}</ul>`;
    disadvantagesDiv.innerHTML = `<h2>Disadvantages:</h2><ul>${insights.label === 'Negative' ? `<li>${insights.text}</li>` : '<li>No disadvantages found.</li>'}</ul>`;
}

function showFileName() {
    const input = document.getElementById('pdf-file');
    const fileName = input.files[0].name;
    const label = input.nextElementSibling;
    label.innerText = fileName;
}
