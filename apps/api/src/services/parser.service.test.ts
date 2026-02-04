import { describe, it, expect } from 'vitest';
import { ParserService } from './parser.service';

describe('ParserService - Tech Mahindra Edge Case', () => {
    const techMahindraText = `
Mega Walkin Drive- Service Desk Technical support(International Voice)
Tech Mahindra
3.442369 Reviews
Company Logo
0 - 5 years
3-5.5 Lacs P.A.
Hyderabad
Time and Venue
2nd February - 6th February , 11.00 AM - 1.00 PM
Tech Mahindra, Bahadurpally (View on map)
Contact - Aniketh 
Send me jobs like this
Posted: 3 days ago
Openings: 30
Applicants: 100+
Save
I am interested
Follow Tech Mahindra as you apply to stay updated
Company Logo
Mega Walkin Drive- Service Desk Technical support(International Voice)
Tech Mahindra
3.442369 Reviews
Send me jobs like thisI am interested
Job highlights
0-5 years experience in international voice technical support with excellent English communication skills
Handle customer queries, troubleshoot technical issues, and maintain documentation
Training and career growth opportunities
Job match score
Early Applicant
Keyskills
Location
Work Experience
Job description
Hiring for - Service Desk (Technical Support || International voice) Role :

Technical support associate
Senior Technical Support associate
Job Description: We are looking for enthusiastic candidates to join our Technical Support International Voice (Service Desk) team. The role involves handling customer queries, providing timely solutions, and maintaining excellent service quality.

Key Responsibilities:

Technical Support (L1/L2)
Respond to customer queries via calls/emails.
Troubleshoot and resolve technical issues.
Maintain proper documentation of incidents.
Ensure customer satisfaction with prompt service.
Service Desk Operations
ITSM Tools (ServiceNow, BMC Remedy, HPSM, CA Service Desk)
Active Directory (User Management, Password Reset, Account Unlock)
Microsoft Office & O365 Support (Outlook, Excel, Teams)
Windows OS (7/8/10) & Desktop Troubleshooting
VPN / Citrix / Exchange Support
Hardware & Network Troubleshooting (LAN, Printers, Devices)
Remote Troubleshooting (Desktop, Laptop, Mobile, Printers)
Antivirus, Patch Management, SCCM basics
Voice (Excellent Communication Skills) Knowledge of ITIL Processes
Requirements:

Fresher (NO PURSUING)
0- 5 years experience in technical support only into International voice
Excellent communication skills in English.
Willingness to work in rotational shifts.(Night shifts) 24/7
work from office
Work location - Bahadurpally
Immediate joiner
Basic knowledge of Technical issues
Perks/Benefits:

Training and career growth opportunities
Friendly work environment

Walk-in Details: Candidates should carry their Resume and Aadhar card with them and please do mention Aniket on top of your resume while coming.

Note : Please do not walk in on festive dates, Saturday & Sundays.




Role: Technical Support - Voice / Blended
Industry Type: IT Services & Consulting
Department: Customer Success, Service & Operations
Employment Type: Full Time, Permanent
Role Category: Voice / Blended
Education
UG: Graduation Not Required
Key Skills
Skills highlighted with ‘‘ are preferred keyskills
Service DeskInternational Voice Process
Ticketing Tools,Technical Support,International Technical Support,Technical Voice Process,Us Voice Process,Voice Support,International BPO
    `;

    it('should extract company name correctly', () => {
        const parsed = ParserService.parse(techMahindraText);
        expect(parsed.company).toBe('Tech Mahindra');
    });

    it('should extract locations correctly', () => {
        const parsed = ParserService.parse(techMahindraText);
        expect(parsed.locations).toContain('Hyderabad');
    });

    it('should extract experience correctly', () => {
        const parsed = ParserService.parse(techMahindraText);
        expect(parsed.experienceMin).toBe(0);
        expect(parsed.experienceMax).toBe(5);
    });

    it('should extract salary correctly', () => {
        const parsed = ParserService.parse(techMahindraText);
        expect(parsed.salaryMin).toBe(3);
        expect(parsed.salaryMax).toBe(5.5);
    });

    it('should extract key skills correctly', () => {
        const parsed = ParserService.parse(techMahindraText);
        const skills = parsed.skills.map(s => s.toLowerCase());

        const expectedSkills = ['technical support', 'voice process', 'active directory', 'itsm'];
        const missing = expectedSkills.filter(s => !skills.some(extracted => extracted.includes(s)));

        expect(missing, `Extracted: [${parsed.skills.join(', ')}]. Missing: [${missing.join(', ')}]`).toHaveLength(0);
    });

    it('should extract walk-in details correctly', () => {
        const parsed = ParserService.parse(techMahindraText);
        expect(parsed.type).toBe('WALKIN');
        expect(parsed.dateRange).toContain('2nd February');
        expect(parsed.dateRange).toContain('6th February');
        expect(parsed.timeRange).toContain('11.00 AM');
        expect(parsed.timeRange).toContain('1.00 PM');
    });
});
