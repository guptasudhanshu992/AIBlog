document.addEventListener("DOMContentLoaded", () => {
    const navigateTo = url => {
        history.pushState(null, null, url);
        router();
    };

    const router = async () => {
        const routes = [
            { path: "/", view: "index.html" },
            { path: "/index.html", view: "index.html" },
            { path: "/signup.html", view: "signup.html" },
            { path: "/login.html", view: "login.html" },
            { path: "/resume.html", view: "resume.html" },
            { path: "/cover_letter.html", view: "cover_letter.html" },
            { path: "/ats.html", view: "ats.html" },
            { path: "/profile.html", view: "profile.html" },
        ];

        // Find the matching route
        const potentialMatch = routes.find(route => route.path === location.pathname);

        if (potentialMatch) {
            const response = await fetch(potentialMatch.view);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            document.querySelector("#main-content").innerHTML = doc.querySelector('main').innerHTML;
            document.title = doc.title;

            if (potentialMatch.path === '/resume.html') {
                handleResumePage();
            } else if (potentialMatch.path === '/cover_letter.html') {
                handleCoverLetterPage();
            } else if (potentialMatch.path === '/ats.html') {
                handleAtsPage();
            }
        } else {
            // Handle 404 Not Found
            document.querySelector("#main-content").innerHTML = "<h1>404 - Not Found</h1>";
            document.title = "404 - Not Found";
        }
    };

    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            navigateTo(e.target.href);
        }
    });

    window.addEventListener("popstate", router);

    router();
});

function handleResumePage() {
    const { jsPDF } = window.jspdf;

    const addEducationButton = document.getElementById('add-education');
    const educationSection = document.getElementById('education-section');
    const addExperienceButton = document.getElementById('add-experience');
    const experienceSection = document.getElementById('experience-section');
    const resumeForm = document.getElementById('resume-form');

    let educationCount = 0;
    let experienceCount = 0;

    addEducationButton.addEventListener('click', () => {
        educationCount++;
        const newEducationEntry = document.createElement('div');
        newEducationEntry.classList.add('education-entry');
        newEducationEntry.innerHTML = `
            <hr>
            <h4>Education #${educationCount}</h4>
            <label for="school-${educationCount}">School/University:</label>
            <input type="text" id="school-${educationCount}" name="school-${educationCount}" required>
            <label for="degree-${educationCount}">Degree:</label>
            <input type="text" id="degree-${educationCount}" name="degree-${educationCount}" required>
            <label for="edu-year-${educationCount}">Year of Completion:</label>
            <input type="text" id="edu-year-${educationCount}" name="edu-year-${educationCount}" required>
        `;
        educationSection.appendChild(newEducationEntry);
    });

    addExperienceButton.addEventListener('click', () => {
        experienceCount++;
        const newExperienceEntry = document.createElement('div');
        newExperienceEntry.classList.add('experience-entry');
        newExperienceEntry.innerHTML = `
            <hr>
            <h4>Experience #${experienceCount}</h4>
            <label for="company-${experienceCount}">Company:</label>
            <input type="text" id="company-${experienceCount}" name="company-${experienceCount}" required>
            <label for="role-${experienceCount}">Role:</label>
            <input type="text" id="role-${experienceCount}" name="role-${experienceCount}" required>
            <label for="exp-year-${experienceCount}">Years:</label>
            <input type="text" id="exp-year-${experienceCount}" name="exp-year-${experienceCount}" required>
            <label for="exp-desc-${experienceCount}">Description:</label>
            <textarea id="exp-desc-${experienceCount}" name="exp-desc-${experienceCount}" rows="3"></textarea>
        `;
        experienceSection.appendChild(newExperienceEntry);
    });

    resumeForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const doc = new jsPDF();
        const formData = new FormData(resumeForm);
        const data = Object.fromEntries(formData.entries());

        doc.setFontSize(22);
        doc.text(data.name, 20, 20);

        doc.setFontSize(12);
        doc.text(data.email, 20, 30);
        doc.text(data.phone, 20, 35);
        doc.text(data.linkedin, 20, 40);

        let y = 50;

        // Education
        doc.setFontSize(16);
        doc.text('Education', 20, y);
        y += 10;
        doc.setFontSize(12);
        for (let i = 1; i <= educationCount; i++) {
            doc.text(`${data['school-' + i]} - ${data['degree-' + i]} (${data['edu-year-' + i]})`, 20, y);
            y += 7;
        }

        // Work Experience
        y += 10;
        doc.setFontSize(16);
        doc.text('Work Experience', 20, y);
        y += 10;
        doc.setFontSize(12);
        for (let i = 1; i <= experienceCount; i++) {
            doc.text(`${data['company-' + i]} - ${data['role-' + i]} (${data['exp-year-' + i]})`, 20, y);
            y += 7;
            const descLines = doc.splitTextToSize(data['exp-desc-' + i], 170);
            doc.text(descLines, 25, y);
            y += descLines.length * 7;
        }

        // Skills
        y += 10;
        doc.setFontSize(16);
        doc.text('Skills', 20, y);
        y += 10;
        doc.setFontSize(12);
        const skillLines = doc.splitTextToSize(data.skills, 170);
        doc.text(skillLines, 20, y);

        doc.save('resume.pdf');
    });
}

function handleCoverLetterPage() {
    const coverLetterForm = document.getElementById('cover-letter-form');
    const coverLetterOutput = document.getElementById('cover-letter-output');

    coverLetterForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(coverLetterForm);
        const jobDescription = formData.get('job-description');
        const userProfile = formData.get('user-profile');

        const coverLetterText = `Dear Hiring Manager,

I am writing to express my interest in the position advertised with the following description:
${jobDescription}

My skills and experience are a great match for this role. Here is a summary of my profile:
${userProfile}

I am confident that I can make a significant contribution to your team and I look forward to hearing from you soon.

Sincerely,
[Your Name]`;

        coverLetterOutput.innerHTML = `<pre>${coverLetterText}</pre>`;
    });
}

function handleAtsPage() {
    const atsForm = document.getElementById('ats-form');
    const atsScoreOutput = document.getElementById('ats-score-output');

    const stopWords = new Set(['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now']);

    function getKeywords(text) {
        return text.toLowerCase().split(/\s+/).filter(word => !stopWords.has(word) && word.length > 2);
    }

    atsForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(atsForm);
        const jobDescription = formData.get('job-description-ats');
        const resumeText = formData.get('resume-text');

        const jobKeywords = new Set(getKeywords(jobDescription));
        const resumeKeywords = new Set(getKeywords(resumeText));

        let matchCount = 0;
        for (const keyword of jobKeywords) {
            if (resumeKeywords.has(keyword)) {
                matchCount++;
            }
        }

        const score = jobKeywords.size > 0 ? (matchCount / jobKeywords.size) * 100 : 0;
        atsScoreOutput.innerHTML = `<h3>Your ATS Score is: ${score.toFixed(2)}%</h3>`;
    });
}
