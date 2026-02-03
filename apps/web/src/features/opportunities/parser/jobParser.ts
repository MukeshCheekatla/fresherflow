export function parseJobText(text: string) {
    // Remove common navigation noise
    const navPatterns = [
        /Skip to Main Content/gi, /JOIN THE CONVERSATION/gi, /Careers Homepage/gi,
        /Global Careers/gi, /^Apply$/gm, /^Home$/gm, /Who We Are/gi,
        /Life at .+/gi, /Career Areas/gi, /Join Our Talent Community/gi,
        /Search Jobs/gi, /View All Jobs/gi, /Back to Search/gi
    ];

    navPatterns.forEach(pattern => {
        text = text.replace(pattern, '');
    });

    const result: any = {
        title: '', company: '', location: '', skills: '',
        workMode: 'ONSITE', degrees: [], passoutYears: []
    };

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5 && l.length < 120);

    // TITLE: Look for job role keywords anywhere in text
    const titleKeywords = ['Engineer', 'Developer', 'Manager', 'Designer', 'Analyst', 'Specialist',
        'Lead', 'Architect', 'Director', 'Consultant', 'Administrator', 'Scientist', 'Coordinator',
        'Executive', 'Associate', 'Assistant', 'Officer', 'Representative', 'Agent'];

    for (const line of lines) {
        // Skip if line looks like navigation/metadata
        if (/^\d+$|^Posted|^Location:|^Experience:|^Salary:|^Job ID/i.test(line)) continue;

        // Check if line contains job title keywords
        if (titleKeywords.some(keyword => new RegExp(`\\b${keyword}\\b`, 'i').test(line))) {
            // Validate it's not too generic
            if (line.split(' ').length >= 2 && line.split(' ').length <= 8) {
                result.title = line;
                break;
            }
        }
    }

    // COMPANY: Look for patterns like "About X", "Join X", "X is a", "At X,"
    const companyPatterns = [
        /(?:About|Join|At)\s+([A-Z][^\n,]{2,40})(?:\n|,|\s+is\s+|\s+makes\s+|\s+offers\s+)/i,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\s+(?:is a|is an|makes|offers|provides|specializes)/i,
        /Working (?:at|with|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/i
    ];

    for (const pattern of companyPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            result.company = match[1].trim();
            break;
        }
    }

    // LOCATION: Look for city patterns
    const locationPatterns = [
        /Location:?\s*([A-Z][a-z]+(?:[\s,]+[A-Z][a-z]+)*)/i,
        /\b(Mumbai|Bangalore|Bengaluru|Delhi|NCR|Hyderabad|Pune|Chennai|Kolkata|Ahmedabad|Surat|Jaipur|Kochi|Indore|Chandigarh|Gurgaon|Gurugram|Noida|Powai|Andheri|Bandra|Whitefield|Koramangala|Electronic City|Gachibowli|Hinjewadi|Sholinganallur|Salt Lake|Sector \d+)[,\s]*(India|Maharashtra|Karnataka|Tamil Nadu|Telangana|Gujarat|Rajasthan|Kerala|West Bengal|Haryana|UP|Uttar Pradesh)?/i,
        /([A-Z][a-z]+),\s*(India|Maharashtra|Karnataka|Tamil Nadu)/i
    ];

    for (const pattern of locationPatterns) {
        const match = text.match(pattern);
        if (match) {
            result.location = match[0].replace(/Location:?\s*/i, '').trim();
            break;
        }
    }

    // SKILLS: Comprehensive tech keywords (100+ common skills)
    const skillsList = [
        // Languages
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'C', 'Ruby', 'PHP', 'Swift',
        'Kotlin', 'Go', 'Rust', 'Scala', 'R', 'Perl', 'VB', 'Objective-C',
        // Frontend
        'React', 'Angular', 'Vue', 'Next.js', 'Nuxt', 'Svelte', 'jQuery', 'Bootstrap', 'Tailwind',
        'HTML', 'CSS', 'SASS', 'LESS', 'Webpack', 'Vite', 'Redux', 'MobX',
        // Backend
        'Node', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring', 'ASP.NET', 'Laravel', 'Rails',
        '.NET', 'MVC', 'Hibernate', 'Entity Framework',
        // Databases
        'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'MSSQL', 'Oracle', 'Redis', 'Cassandra',
        'DynamoDB', 'Elasticsearch', 'Neo4j', 'SSIS', 'SSRS',
        // Cloud & DevOps
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab', 'GitHub', 'CI/CD',
        'Terraform', 'Ansible', 'Puppet', 'Chef', 'Helm', 'ArgoCD',
        // Tools & Others
        'Git', 'REST', 'API', 'GraphQL', 'gRPC', 'Kafka', 'RabbitMQ', 'Microservices', 'OAuth',
        'JWT', 'Agile', 'Scrum', 'Jira', 'Confluence', 'Tableau', 'Power BI', 'Looker',
        'Selenium', 'Cypress', 'Jest', 'Mocha', 'JUnit', 'TestNG', 'Postman', 'Swagger',
        'Linux', 'Unix', 'Shell', 'Bash', 'PowerShell', 'Nginx', 'Apache', 'Tomcat', 'Blazor'
    ];

    const foundSkills = skillsList.filter(skill => {
        const escapedSkill = skill.replace(/[+#.]/g, '\\$&');
        return new RegExp(`\\b${escapedSkill}\\b`, 'i').test(text);
    });
    result.skills = foundSkills.join(', ');

    // WORK MODE
    if (/\b(fully remote|100% remote|remote.?only|work from home|wfh)\b/i.test(text)) {
        result.workMode = 'REMOTE';
    } else if (/\b(hybrid|flexible|remote.?friendly|2.?3 days office|3.?2 days office)\b/i.test(text)) {
        result.workMode = 'HYBRID';
    } else {
        result.workMode = 'ONSITE';
    }

    // EDUCATION
    if (/\b(bachelor|B\.?E\.?|B\.?Tech|B\.?S\.?|B\.?C\.?A|graduation|graduate degree|undergraduate|UG)\b/i.test(text)) {
        result.degrees.push('DEGREE');
    }
    if (/\b(diploma|polytechnic)\b/i.test(text)) {
        if (!result.degrees.includes('DIPLOMA')) result.degrees.push('DIPLOMA');
    }
    if (/\b(master|M\.?E\.?|M\.?Tech|M\.?S\.?|M\.?C\.?A|M\.?B\.?A|post.?graduate|PG)\b/i.test(text)) {
        result.degrees.push('PG');
    }

    // Default if no degrees found
    if (result.degrees.length === 0) {
        result.degrees.push('DEGREE');
    }

    // PASSOUT YEARS
    const year = new Date().getFullYear();
    const yearMatches = text.match(/\b(20\d{2})\b/g);
    if (yearMatches) {
        const validYears = yearMatches
            .map(y => parseInt(y))
            .filter(y => y >= 2020 && y <= year + 2);
        if (validYears.length > 0) {
            result.passoutYears = [...new Set(validYears)].sort();
        }
    }
    // Don't set default years - leave empty if not mentioned in job description

    result.description = text.trim().substring(0, 2000);

    return result;
}

